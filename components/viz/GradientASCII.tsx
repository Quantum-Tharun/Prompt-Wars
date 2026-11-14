"use client";

import React, { useEffect, useRef, useState } from "react";
import "./GradientASCII.css";

export interface GradientASCIIProps {
  cellSize?: number;
  characters?: string;
  colors?: string[];
  density?: number;
  flicker?: number;
  flow?: number;
  fontFamily?: string;
  glow?: number;
  glyphOpacity?: number;
  gradientOpacity?: number;
  grain?: number;
  intro?: boolean;
  lightMode?: boolean;
  mouseInteraction?: boolean;
  scale?: number;
  scrambleRadius?: number;
  shape?: "horizon" | "circle" | "plane";
  softness?: number;
  speed?: number;
  clickEffect?: "wave" | "none";
  className?: string;
}

function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace("#", "");
  const num = parseInt(clean, 16);
  if (clean.length === 3) {
    const r = ((num >> 8) & 0xf) * 17;
    const g = ((num >> 4) & 0xf) * 17;
    const b = (num & 0xf) * 17;
    return [r / 255, g / 255, b / 255];
  }
  return [((num >> 16) & 0xff) / 255, ((num >> 8) & 0xff) / 255, (num & 0xff) / 255];
}

const VERTEX_SHADER = `#version 300 es
in vec2 a_position;
out vec2 v_uv;

void main() {
  v_uv = (a_position + 1.0) * 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

const FRAGMENT_SHADER = `#version 300 es
precision highp float;

in vec2 v_uv;
out vec4 fragColor;

uniform vec2 u_resolution;
uniform float u_time;
uniform vec2 u_mouse;
uniform float u_click_time;
uniform vec2 u_click_pos;
uniform float u_cell_size;
uniform float u_char_count;
uniform sampler2D u_font_atlas;

uniform vec3 u_color0;
uniform vec3 u_color1;
uniform vec3 u_color2;
uniform vec3 u_color3;
uniform vec3 u_color4;

uniform float u_light_mode;
uniform float u_glyph_opacity;
uniform float u_gradient_opacity;
uniform float u_flow;
uniform float u_scramble_radius;
uniform float u_density;
uniform float u_grain;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

void main() {
  vec2 pixel_coord = v_uv * u_resolution;
  vec2 cell_coord = floor(pixel_coord / u_cell_size);
  vec2 cell_uv = fract(pixel_coord / u_cell_size);

  vec2 norm_cell = (cell_coord * u_cell_size) / u_resolution;

  // Wave ripple from click
  float dist_click = length(norm_cell - u_click_pos);
  float wave = 0.0;
  if (u_click_time > 0.0) {
    float wave_radius = u_click_time * 0.8;
    float wave_dist = abs(dist_click - wave_radius);
    if (wave_dist < 0.1) {
      wave = (1.0 - wave_dist / 0.1) * max(0.0, 1.0 - u_click_time * 1.2);
    }
  }

  // Pointer scramble
  float mouse_dist = length(norm_cell - u_mouse);
  float mouse_factor = smoothstep(u_scramble_radius, 0.0, mouse_dist);

  // Field noise
  vec2 noise_pos = norm_cell * 2.5 + vec2(u_time * u_flow * 0.15, sin(norm_cell.x * 3.0 + u_time * 0.2) * 0.2);
  float field = noise(noise_pos);
  field += wave * 0.4;
  field += mouse_factor * (hash(cell_coord + floor(u_time * 10.0)) - 0.5) * 0.6;
  field = clamp(field * u_density, 0.0, 0.999);

  // Select character index
  float char_idx = floor(field * u_char_count);

  // Atlas coordinate
  vec2 atlas_uv = vec2((char_idx + cell_uv.x) / u_char_count, 1.0 - cell_uv.y);
  float char_sample = texture(u_font_atlas, atlas_uv).r;

  // Palette interpolation
  float color_t = field * 4.0;
  vec3 grad_color;
  if (color_t < 1.0) {
    grad_color = mix(u_color0, u_color1, color_t);
  } else if (color_t < 2.0) {
    grad_color = mix(u_color1, u_color2, color_t - 1.0);
  } else if (color_t < 3.0) {
    grad_color = mix(u_color2, u_color3, color_t - 2.0);
  } else {
    grad_color = mix(u_color3, u_color4, color_t - 3.0);
  }

  // Subdued grain
  float grain_val = (hash(pixel_coord + u_time) - 0.5) * u_grain;

  vec3 base_color = u_light_mode > 0.5 ? vec3(0.925, 0.933, 0.929) : vec3(0.094, 0.098, 0.106);
  vec3 final_color = mix(base_color, grad_color, u_gradient_opacity);

  // Blend glyph mask
  vec3 glyph_color = u_light_mode > 0.5 ? vec3(0.094, 0.098, 0.106) : vec3(0.968, 0.972, 0.968);
  final_color = mix(final_color, glyph_color, char_sample * u_glyph_opacity);
  final_color += grain_val;

  fragColor = vec4(final_color, 1.0);
}
`;

export function GradientASCII({
  cellSize = 14,
  characters = " =+xX0S8#@",
  colors = ["#ECEEED", "#C5C9C7", "#5F6563", "#146348", "#18191B"],
  density = 0.75,
  flicker = 0.08,
  flow = 0.35,
  fontFamily = "IBM Plex Mono, ui-monospace, monospace",
  glow = 0,
  glyphOpacity = 0.7,
  gradientOpacity = 0.18,
  grain = 0.05,
  intro = true,
  lightMode = true,
  mouseInteraction = true,
  scale = 1.1,
  scrambleRadius = 0.12,
  shape = "horizon",
  softness = 0.6,
  speed = 0.6,
  clickEffect = "wave",
  className = "",
}: GradientASCIIProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef<{ x: number; y: number }>({ x: -10, y: -10 });
  const clickRef = useRef<{ x: number; y: number; time: number }>({ x: -10, y: -10, time: -1 });

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const gl = canvas.getContext("webgl2", { alpha: false, antialias: false });
    if (!gl) return;

    // Build Shader Program
    const vs = gl.createShader(gl.VERTEX_SHADER)!;
    gl.shaderSource(vs, VERTEX_SHADER);
    gl.compileShader(vs);

    const fs = gl.createShader(gl.FRAGMENT_SHADER)!;
    gl.shaderSource(fs, FRAGMENT_SHADER);
    gl.compileShader(fs);

    const program = gl.createProgram()!;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error(gl.getProgramInfoLog(program));
      return;
    }

    // Quad Buffer
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW
    );

    const aPosition = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(aPosition);
    gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0);

    // Create Font Atlas Texture
    const atlasCanvas = document.createElement("canvas");
    const atlasSize = 64;
    const charCount = characters.length;
    atlasCanvas.width = atlasSize * charCount;
    atlasCanvas.height = atlasSize;
    const ctx = atlasCanvas.getContext("2d");

    if (ctx) {
      ctx.fillStyle = "#000000";
      ctx.fillRect(0, 0, atlasCanvas.width, atlasCanvas.height);
      ctx.fillStyle = "#FFFFFF";
      ctx.font = `bold ${Math.round(atlasSize * 0.75)}px ${fontFamily}`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      for (let i = 0; i < charCount; i++) {
        ctx.fillText(characters[i], i * atlasSize + atlasSize / 2, atlasSize / 2);
      }
    }

    const atlasTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, atlasTexture);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      atlasCanvas
    );
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    // Uniform Locations
    gl.useProgram(program);
    const uResolution = gl.getUniformLocation(program, "u_resolution");
    const uTime = gl.getUniformLocation(program, "u_time");
    const uMouse = gl.getUniformLocation(program, "u_mouse");
    const uClickTime = gl.getUniformLocation(program, "u_click_time");
    const uClickPos = gl.getUniformLocation(program, "u_click_pos");
    const uCellSize = gl.getUniformLocation(program, "u_cell_size");
    const uCharCount = gl.getUniformLocation(program, "u_char_count");
    const uFontAtlas = gl.getUniformLocation(program, "u_font_atlas");

    const uLightMode = gl.getUniformLocation(program, "u_light_mode");
    const uGlyphOpacity = gl.getUniformLocation(program, "u_glyph_opacity");
    const uGradientOpacity = gl.getUniformLocation(program, "u_gradient_opacity");
    const uFlow = gl.getUniformLocation(program, "u_flow");
    const uScrambleRadius = gl.getUniformLocation(program, "u_scramble_radius");
    const uDensity = gl.getUniformLocation(program, "u_density");
    const uGrain = gl.getUniformLocation(program, "u_grain");

    const uColor0 = gl.getUniformLocation(program, "u_color0");
    const uColor1 = gl.getUniformLocation(program, "u_color1");
    const uColor2 = gl.getUniformLocation(program, "u_color2");
    const uColor3 = gl.getUniformLocation(program, "u_color3");
    const uColor4 = gl.getUniformLocation(program, "u_color4");

    const rgbColors = colors.slice(0, 5).map(hexToRgb);
    while (rgbColors.length < 5) rgbColors.push([0.5, 0.5, 0.5]);

    gl.uniform3fv(uColor0, rgbColors[0]);
    gl.uniform3fv(uColor1, rgbColors[1]);
    gl.uniform3fv(uColor2, rgbColors[2]);
    gl.uniform3fv(uColor3, rgbColors[3]);
    gl.uniform3fv(uColor4, rgbColors[4]);

    gl.uniform1f(uCellSize, cellSize);
    gl.uniform1f(uCharCount, charCount);
    gl.uniform1f(uLightMode, lightMode ? 1.0 : 0.0);
    gl.uniform1f(uGlyphOpacity, glyphOpacity);
    gl.uniform1f(uGradientOpacity, gradientOpacity);
    gl.uniform1f(uFlow, flow);
    gl.uniform1f(uScrambleRadius, scrambleRadius);
    gl.uniform1f(uDensity, density);
    gl.uniform1f(uGrain, grain);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, atlasTexture);
    gl.uniform1i(uFontAtlas, 0);

    // Resize Handler
    const updateSize = () => {
      const rect = container.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = Math.floor(rect.width * dpr);
      const height = Math.floor(rect.height * dpr);

      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
        gl.viewport(0, 0, width, height);
      }
    };
    updateSize();

    const resizeObserver = new ResizeObserver(updateSize);
    resizeObserver.observe(container);

    // Mouse Listeners
    const handleMouseMove = (e: MouseEvent) => {
      if (!mouseInteraction) return;
      const rect = canvas.getBoundingClientRect();
      mouseRef.current.x = (e.clientX - rect.left) / rect.width;
      mouseRef.current.y = (e.clientY - rect.top) / rect.height;
    };

    const handleMouseLeave = () => {
      mouseRef.current.x = -10;
      mouseRef.current.y = -10;
    };

    const handleClick = (e: MouseEvent) => {
      if (clickEffect === "none") return;
      const rect = canvas.getBoundingClientRect();
      clickRef.current.x = (e.clientX - rect.left) / rect.width;
      clickRef.current.y = (e.clientY - rect.top) / rect.height;
      clickRef.current.time = 0.0;
    };

    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseleave", handleMouseLeave);
    canvas.addEventListener("click", handleClick);

    // Render Loop
    let animId: number;
    let startTime = performance.now();
    let isVisible = true;

    const intersectionObserver = new IntersectionObserver(([entry]) => {
      isVisible = entry.isIntersecting;
    });
    intersectionObserver.observe(canvas);

    const render = (time: number) => {
      if (isVisible) {
        const elapsed = (time - startTime) * 0.001 * speed;

        if (clickRef.current.time >= 0) {
          clickRef.current.time += 0.016;
          if (clickRef.current.time > 1.5) {
            clickRef.current.time = -1;
          }
        }

        gl.useProgram(program);
        gl.uniform2f(uResolution, canvas.width, canvas.height);
        gl.uniform1f(uTime, elapsed);
        gl.uniform2f(uMouse, mouseRef.current.x, mouseRef.current.y);
        gl.uniform1f(uClickTime, clickRef.current.time);
        gl.uniform2f(uClickPos, clickRef.current.x, clickRef.current.y);

        gl.drawArrays(gl.TRIANGLES, 0, 6);
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseleave", handleMouseLeave);
      canvas.removeEventListener("click", handleClick);
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      gl.deleteBuffer(positionBuffer);
      gl.deleteTexture(atlasTexture);
    };
  }, [
    cellSize,
    characters,
    colors,
    density,
    flow,
    fontFamily,
    glyphOpacity,
    gradientOpacity,
    grain,
    lightMode,
    mouseInteraction,
    scrambleRadius,
    speed,
    clickEffect,
  ]);

  return (
    <div ref={containerRef} className={`gradient-ascii-container ${className}`}>
      <canvas ref={canvasRef} className="gradient-ascii-canvas" />
    </div>
  );
}

