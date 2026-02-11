import React, { useRef, useEffect } from "react";
import * as d3 from "d3";

export default function WaveformBarChart({
  data,
  width = 600,
  height = 300,
}) {
  const ref = useRef();

  useEffect(() => {
    const svg = d3.select(ref.current);
    svg.selectAll("*").remove();

    if (!data || data.length === 0) return;

    // マージン
    const margin = { top: 20, right: 20, bottom: 30, left: 40 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // スケール
    const x = d3
      .scaleBand()
      .domain(data.map((_, i) => i))
      .range([0, innerWidth])
      .padding(0.1);

    const y = d3
      .scaleLinear()
      .domain([
        d3.min(data),
        d3.max(data)
      ])
      .nice()
      .range([innerHeight, 0]);

    // 軸
    const xAxis = d3.axisBottom(x).tickValues(
      x.domain().filter((_, i) => i % Math.ceil(data.length / 10) === 0)
    );

    const yAxis = d3.axisLeft(y);

    g.append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(xAxis);

    g.append("g")
      .call(yAxis);

    // ゼロライン（波形らしく）
    g.append("line")
      .attr("x1", 0)
      .attr("x2", innerWidth)
      .attr("y1", y(0))
      .attr("y2", y(0))
      .attr("stroke", "#888")
      .attr("stroke-dasharray", "2,2");

    // 棒描画
    g.selectAll(".bar")
      .data(data)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", (_, i) => x(i))
      .attr("width", x.bandwidth())
      .attr("y", d => (d >= 0 ? y(d) : y(0)))
      .attr("height", d => Math.abs(y(d) - y(0)))
      .attr("fill", d => (d >= 0 ? "#4e79a7" : "#e15759"));

  }, [data, width, height]);

  return <svg ref={ref} width={width} height={height} />;
}
