"use client";

import { useEffect, useRef } from 'react';
import { createChart, CrosshairMode, IChartApi, CandlestickData, LineData, SeriesMarker, Time, UTCTimestamp } from 'lightweight-charts';

export type Candle = {
  time: number; // unix seconds
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};

export type Overlay = {
  id: string;
  type: 'line';
  color: string;
  data: LineData[];
};

export default function CandleChart({
  candles,
  overlays = [],
  markers = [],
  rsi = []
}: {
  candles: Candle[];
  overlays?: Overlay[];
  markers?: SeriesMarker<Time>[];
  rsi?: LineData[];
}) {
  const mainRef = useRef<HTMLDivElement | null>(null);
  const rsiRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<IChartApi | null>(null);

  useEffect(() => {
    if (!mainRef.current || !rsiRef.current) return;

    const chart = createChart(mainRef.current, {
      height: mainRef.current.clientHeight,
      layout: { background: { color: '#ffffff' }, textColor: '#0f172a' },
      grid: { vertLines: { color: '#f1f5f9' }, horzLines: { color: '#f1f5f9' } },
      crosshair: { mode: CrosshairMode.Magnet },
      rightPriceScale: { borderColor: '#e2e8f0' },
      timeScale: { borderColor: '#e2e8f0' }
    });
    chartRef.current = chart;

    const candleSeries = chart.addCandlestickSeries({
      upColor: '#16a34a', downColor: '#ef4444', borderVisible: false,
      wickUpColor: '#16a34a', wickDownColor: '#ef4444'
    });

    const candleData: CandlestickData[] = candles.map(c => ({ time: c.time as UTCTimestamp, open: c.open, high: c.high, low: c.low, close: c.close }));
    candleSeries.setData(candleData);

    // overlays
    const lineSeriesMap = new Map<string, ReturnType<typeof chart.addLineSeries>>();
    overlays.forEach(ov => {
      const s = chart.addLineSeries({ color: ov.color, lineWidth: 2 });
      s.setData(ov.data);
      lineSeriesMap.set(ov.id, s);
    });

    if (markers && markers.length > 0) {
      candleSeries.setMarkers(markers);
    }

    const rsiChart = createChart(rsiRef.current, {
      height: rsiRef.current.clientHeight,
      layout: { background: { color: '#ffffff' }, textColor: '#0f172a' },
      grid: { vertLines: { color: '#f1f5f9' }, horzLines: { color: '#f1f5f9' } },
      crosshair: { mode: CrosshairMode.Magnet },
      rightPriceScale: { borderColor: '#e2e8f0' },
      timeScale: { borderColor: '#e2e8f0' }
    });

    const rsiLine = rsiChart.addLineSeries({ color: '#3b82f6', lineWidth: 2 });
    rsiLine.setData(rsi);

    const upper = rsiChart.addLineSeries({ color: '#94a3b8', lineWidth: 1 });
    const lower = rsiChart.addLineSeries({ color: '#94a3b8', lineWidth: 1 });
    const bounds = rsi.map(d => ({ time: d.time as UTCTimestamp, value: 70 }));
    const bounds2 = rsi.map(d => ({ time: d.time as UTCTimestamp, value: 30 }));
    upper.setData(bounds);
    lower.setData(bounds2);

    const handleResize = () => {
      if (!mainRef.current || !rsiRef.current) return;
      chart.applyOptions({ width: mainRef.current.clientWidth, height: mainRef.current.clientHeight });
      rsiChart.applyOptions({ width: rsiRef.current.clientWidth, height: rsiRef.current.clientHeight });
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
      rsiChart.remove();
    };
  }, [candles, overlays, markers, rsi]);

  return (
    <div>
      <div ref={mainRef} className="chart-container" />
      <div ref={rsiRef} className="rsi-container" />
    </div>
  );
}
