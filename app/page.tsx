"use client";

import { useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { generateIntradaySeries } from '@/lib/simulate';
import { computeMovingAverage, computeRSI } from '@/lib/indicators';
import { backtestSMACrossover } from '@/lib/backtest';

const CandleChart = dynamic(() => import('@/components/CandleChart'), { ssr: false });

export default function HomePage() {
  const [symbol, setSymbol] = useState('AAPL');
  const [minutes, setMinutes] = useState(390); // full US session
  const [interval, setInterval] = useState(1); // 1-minute bars
  const [fast, setFast] = useState(9);
  const [slow, setSlow] = useState(21);
  const [seed, setSeed] = useState(42);

  const data = useMemo(() => generateIntradaySeries({
    bars: Math.max(50, Math.min(5000, Math.floor(minutes / interval))),
    intervalMinutes: interval,
    startPrice: 200,
    drift: 0.0002,
    volatility: 0.01,
    seed
  }), [minutes, interval, seed]);

  const fastMA = useMemo(() => computeMovingAverage(data.map(d => ({ time: d.time, value: d.close })), fast), [data, fast]);
  const slowMA = useMemo(() => computeMovingAverage(data.map(d => ({ time: d.time, value: d.close })), slow), [data, slow]);
  const rsi = useMemo(() => computeRSI(data.map(d => ({ time: d.time, value: d.close })), 14), [data]);

  const results = useMemo(() => backtestSMACrossover({ candles: data, fast, slow }), [data, fast, slow]);

  return (
    <div className="grid">
      <section className="panel controls">
        <div className="row">
          <label>Symbol</label>
          <input value={symbol} onChange={e => setSymbol(e.target.value.toUpperCase())} />
        </div>
        <div className="row">
          <label>Minutes</label>
          <input type="number" min={30} max={10000} value={minutes} onChange={e => setMinutes(Number(e.target.value))} />
        </div>
        <div className="row">
          <label>Interval (m)</label>
          <input type="number" min={1} max={60} value={interval} onChange={e => setInterval(Number(e.target.value))} />
        </div>
        <div className="row">
          <label>Fast SMA</label>
          <input type="number" min={2} max={200} value={fast} onChange={e => setFast(Number(e.target.value))} />
        </div>
        <div className="row">
          <label>Slow SMA</label>
          <input type="number" min={2} max={400} value={slow} onChange={e => setSlow(Number(e.target.value))} />
        </div>
        <div className="row">
          <label>Seed</label>
          <input type="number" min={0} max={100000} value={seed} onChange={e => setSeed(Number(e.target.value))} />
        </div>
        <div className="metrics">
          <div><b>{symbol}</b></div>
          <div>Trades: <b>{results.trades.length}</b></div>
          <div>Return: <b>{(results.totalReturnPct).toFixed(2)}%</b></div>
          <div>Max Drawdown: <b>{(results.maxDrawdownPct).toFixed(2)}%</b></div>
          <div>Win Rate: <b>{(results.winRatePct).toFixed(1)}%</b></div>
          <div>Sharpe (approx): <b>{results.sharpe.toFixed(2)}</b></div>
        </div>
      </section>

      <section className="panel chart">
        <CandleChart
          candles={data}
          overlays={[
            { id: 'fast', type: 'line', color: '#2dd4bf', data: fastMA },
            { id: 'slow', type: 'line', color: '#f97316', data: slowMA }
          ]}
          markers={results.markers}
          rsi={rsi}
        />
      </section>
    </div>
  );
}
