type SceneProps = {
  variant?: "blue" | "peach" | "lilac" | "mint";
  compact?: boolean;
};

function Tree({
  x,
  y,
  s = 1,
  color = "#91b8a1",
}: {
  x: number;
  y: number;
  s?: number;
  color?: string;
}) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M0 0v-34" stroke="#8b9485" strokeWidth="5" />
      <ellipse cy="-43" rx="17" ry="24" fill={color} />
      <ellipse cx="-9" cy="-37" rx="12" ry="15" fill="#b7d4b4" />
      <ellipse cx="8" cy="-48" rx="10" ry="15" fill="#a5c9a8" />
    </g>
  );
}
function Person({
  x,
  y,
  color = "#7096ce",
}: {
  x: number;
  y: number;
  color?: string;
}) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <ellipse cy="1" rx="5" ry="2" fill="#b0beca" opacity=".22" />
      <path d="M-2 0v-10h4V0" stroke="#66718c" strokeWidth="2" />
      <path d="M-4-8l1-12h6l2 12" fill={color} />
      <circle cy="-24" r="3.5" fill="#c39173" />
    </g>
  );
}
function TempleBuilding({
  color = "#a9c6ee",
  style = 0,
}: {
  color?: string;
  style?: number;
}) {
  return (
    <g>
      <path d="M-112 18L0-48 116 16 2 84Z" fill="#dae4ed" />
      <path d="M-112 18v12L2 97V84Z" fill="#b1c5d8" />
      <path d="M2 84l114-68v13L2 97Z" fill="#c6d5e5" />
      <path d="M-88 11L0-40 88 11 0 63Z" fill="#f8fbff" />
      <path d="M-73 8v-54L0-88v54Z" fill="#dae7f7" />
      <path d="M0-34l73-41v83L0 51Z" fill={color} />
      <path d="M-73-46L0-89 73-46 0-3Z" fill="#f6f9fd" />
      <path d="M-82-49L0-97 82-49 0-1Z" fill="#c2d4e8" />
      <path d="M-82-49v7L0 6V-1Z" fill="#e1ebf8" />
      <path d="M0-1l82-48v7L0 6Z" fill="#a7c0e2" />
      {[-53, -31].map((x) => (
        <g key={x}>
          <path d={`M${x} -31v52l8 5v-52Z`} fill="#f9fbff" />
          <path d={`M${x + 8} -26v52l5-3v-52Z`} fill="#bdcee3" />
        </g>
      ))}
      <path d="M20 39v-35q11-23 22-13v35Z" fill="#657f9d" />
      <path d="M25 35V6q6-15 12-9v30Z" fill="#48617d" />
      <path d="M-39-74L0-97 41-74 0-50Z" fill="#f5f8fc" />
      {Array.from({ length: style === 1 ? 7 : 5 }, (_, i) => {
        const w = 43 - i * 5,
          y = -80 - i * 22;
        return (
          <g key={i}>
            <path
              d={`M${-w} ${y}L0 ${y - w * 0.57} ${w} ${y} 0 ${y + w * 0.57}Z`}
              fill="#f8fbff"
            />
            <path
              d={`M${-w} ${y}v-17L0 ${y - w * 0.57 - 17}v${w * 1.14 + 17}Z`}
              fill="#dde8f7"
            />
            <path
              d={`M0 ${y - w * 0.57 - 17}L${w} ${y - 17}v17L0 ${y + w * 0.57}Z`}
              fill={color}
            />
            <path
              d={`M${-w - 4} ${y - 16}L0 ${y - w * 0.57 - 19} ${w + 4} ${y - 16} 0 ${y + w * 0.57 - 13}Z`}
              fill="#f6f9ff"
            />
            {[-1, 1].map((v) => (
              <path
                key={v}
                d={`M${v * w * 0.46} ${y - 9}v-11`}
                stroke="#91a9c7"
                strokeWidth="3"
              />
            ))}
          </g>
        );
      })}
      <path
        d={
          style === 1
            ? "M-10-240L0-256 10-240 0-234Z"
            : "M-17-199Q-16-222 0-232Q16-222 17-199L0-190Z"
        }
        fill="#cfb47c"
      />
      <path
        d={style === 1 ? "M0-255v-35" : "M0-230v-35"}
        stroke="#b59a67"
        strokeWidth="2.5"
      />
      <g className="temple-flag">
        <path
          d={
            style === 1
              ? "M2-289q14-7 29 0l-7 7 7 3q-17-7-29 0Z"
              : "M2-265q14-7 29 0l-7 7 7 3q-17-7-29 0Z"
          }
          fill="#e8b56d"
        />
      </g>
      {[0, 1, 2, 3, 4].map((i) => (
        <path
          key={i}
          d={`M${8 + i * -8} ${63 + i * 5}l38-23 8 5-38 23Z`}
          fill={i % 2 ? "#ecf3fc" : "#c7d8eb"}
        />
      ))}
    </g>
  );
}

export function SacredWorld({ variant = "blue", compact = false }: SceneProps) {
  const color = {
    blue: "#a9c6ee",
    peach: "#e3c09b",
    lilac: "#c7bce6",
    mint: "#abd0b8",
  }[variant];
  if (compact)
    return (
      <svg className="small-world" viewBox="0 0 340 290" aria-hidden="true">
        <g transform="translate(170 229) scale(.76)">
          <path d="M-170 0L0-99 170 0 0 99Z" fill="#d7e4df" />
          <path d="M-170 0v12L0 111V99Z" fill="#b5cacc" />
          <path d="M0 99L170 0v12L0 111Z" fill="#c3d5d1" />
          <Tree x={-119} y={-11} s={1.1} />
          <Tree x={108} y={-9} s={0.95} />
          <g transform="translate(0 -6) scale(.82)">
            <TempleBuilding color={color} style={variant === "peach" ? 1 : 0} />
          </g>
          <Person x={-62} y={18} />
          <Person x={48} y={49} color="#c4959e" />
          <path d="M-119 36l24 14 27-15-24-14Z" fill="#b6d8ef" />
        </g>
      </svg>
    );
  return (
    <svg
      className="sacred-world"
      viewBox="0 0 1440 440"
      role="img"
      aria-label="An isometric temple, a community village, and a garden of giving connected by a peaceful winding pilgrimage path"
    >
      <defs>
        <linearGradient id="mountain" x2="0" y2="1">
          <stop stopColor="#e2effc" />
          <stop offset="1" stopColor="#f5faff" />
        </linearGradient>
      </defs>
      <g className="cloud cloud-one" fill="#ecf5fd">
        <path d="M41 254q25-19 48-7 9-34 38-23 21-42 50-12 34-5 40 24 30-3 37 18Z" />
        <path d="M1180 112q20-23 42-12 8-31 35-22 20-29 42-7 25-6 32 21 27-2 32 20Z" />
      </g>
      <g fill="url(#mountain)">
        <path d="M235 293L371 124 419 176 477 85 589 264 680 186 770 301Z" />
        <path d="M826 287l116-143 35 39 78-101 115 188 74-107 123 139Z" />
      </g>
      <g fill="#fff" opacity=".9">
        <path d="M345 157l26-33 48 52-36-15-13-14-12 18Z" />
        <path d="M446 130l31-45 40 64-37-19-10-17-9 18Z" />
        <path d="M1024 128l31-46 44 72-40-23-11-14-11 20Z" />
      </g>
      <circle cx="1020" cy="94" r="27" fill="#fcf0cf" />
      <path
        className="journey-dashes"
        d="M184 296C275 281 316 363 418 338S525 314 586 351S783 434 910 341S1088 290 1241 247"
        fill="none"
        stroke="#9bbde9"
        strokeWidth="2"
        strokeDasharray="6 9"
      />
      <g className="floating-island island-left" transform="translate(227 258)">
        <path d="M-139 0L0-70 139 0 0 75Z" fill="#e3eadd" />
        <path d="M-139 0L-91 55-28 79 0 105V75Z" fill="#d5d0e8" />
        <path d="M0 75v30L64 72 139 0Z" fill="#c1c5de" />
        <path d="M-107 0L0-55 106 0 0 57Z" fill="#edf1e8" />
        <Tree x={-77} y={-7} s={0.85} />
        <Tree x={72} y={6} s={0.8} />
        <Tree x={28} y={-35} s={0.65} />
        <path d="M-43 1v-47L0-70 44-45v47L0 25Z" fill="#fcf5e8" />
        <path d="M0-23l44-22v47L0 25Z" fill="#e5d7c5" />
        <path d="M-55-47L-9-76 53-47 7-20Z" fill="#d7ada0" />
        <path d="M-55-47v7L7-13v-7Z" fill="#c89389" />
        <path d="M13 17v-25l13-7v25Z" fill="#a98f8a" />
        <path d="M-28-18v12l12 6v-12Z" fill="#b5c9d6" />
        <Person x={-39} y={34} color="#c79f83" />
        <Person x={39} y={29} />
      </g>
      <g className="floating-island island-main" transform="translate(720 280)">
        <path d="M-220 0L0-116 220 0 0 121Z" fill="#d7e6df" />
        <path d="M-220 0l32 49 74 10 46 49 68 42v-29Z" fill="#c8d6dc" />
        <path d="M0 121v29l76-43 42-15 64-51L220 0Z" fill="#b5cdd7" />
        <path d="M-195 0L0-102 194 0 0 107Z" fill="#edf2e8" />
        <path d="M-178-7l52-29 11 6-52 29Z" fill="#d3dfd2" />
        <Tree x={-157} y={-16} s={1.2} />
        <Tree x={-111} y={-56} s={0.8} />
        <Tree x={130} y={-43} s={1.1} />
        <Tree x={171} y={15} s={0.8} />
        <Tree x={-103} y={60} s={0.65} />
        <g transform="translate(0 -16) scale(.94)">
          <TempleBuilding />
        </g>
        <path d="M64 54l54-30 43 24-54 31Z" fill="#a9d9ec" />
        <path d="M75 54l42-23 31 17-42 23Z" fill="#c6e8f3" />
        <ellipse cx="118" cy="48" rx="7" ry="3" fill="#fafcff" />
        <Person x={-51} y={52} />
        <Person x={-21} y={72} color="#d4a0a0" />
        <Person x={71} y={4} color="#d0b282" />
        <Person x={-119} y={8} color="#879aaf" />
        <path d="M-11 119l44-25 34 18-44 26Z" fill="#e8eff7" />
        <path d="M-11 119v7l34 19v-7Z" fill="#c1d0e0" />
      </g>
      <g
        className="floating-island island-right"
        transform="translate(1202 245)"
      >
        <path d="M-126 0L0-67 126 0 0 70Z" fill="#dceadd" />
        <path d="M-126 0l38 57 47 4 41 39V70Z" fill="#c2d7e3" />
        <path d="M0 70v30l73-43L126 0Z" fill="#b4cbdc" />
        <path d="M-107 0L0-56 107 0 0 58Z" fill="#f0f6ea" />
        <Tree x={-79} y={-13} s={0.85} />
        <Tree x={79} y={2} s={0.8} />
        <path d="M-48 12v-64q0-44 48-44t48 44v64L0 39Z" fill="#e4dff2" />
        <path d="M-39 10v-62q0-33 39-33t39 33v62L0 31Z" fill="#fbfaff" />
        <ellipse cy="19" rx="38" ry="19" fill="#c8c5e6" />
        <g transform="translate(0 -7)">
          <path
            d="M0 13Q-39 5-28-16Q-9-17 0 13Q-17-22 0-33Q18-20 0 13Q12-18 30-16Q39 7 0 13Z"
            fill="#d5bce5"
          />
          <path d="M0 13Q-19-7 0-22Q18-6 0 13Z" fill="#efdaef" />
        </g>
        <path
          className="heart-float"
          d="M0-47C-31-63-14-83 0-69C14-83 31-63 0-47"
          fill="#e3a6b6"
        />
      </g>
      <g className="cloud cloud-two" fill="#f5faff">
        <path d="M30 369q25-29 54-13 14-33 43-17 23-41 52-9 34-9 47 23 28-10 46 16Z" />
        <path d="M1043 369q22-24 47-13 11-31 39-19 24-35 51-7 27-9 45 19 33-10 48 20Z" />
        <path d="M423 408q20-27 45-12 17-39 47-17 22-23 44 4 33-8 45 25Z" />
      </g>
      <g fill="none" stroke="#92aac3" strokeWidth="1.5" strokeLinecap="round">
        <path d="M327 85q7-7 14 0 7-7 14 0M1116 71q7-7 14 0 7-7 14 0M905 43q5-5 10 0 5-5 10 0" />
      </g>
      <g fill="#73a7e8">
        <path
          d="M401 272c-16-20-23-29-23-38a23 23 0 0146 0c0 9-7 18-23 38Z"
          transform="translate(184 130) scale(.55)"
        />
        <circle cx="404" cy="259" r="4" fill="#fff" />
        <circle r="5" className="traveler">
          <animateMotion
            dur="18s"
            repeatCount="indefinite"
            path="M184 296C275 281 316 363 418 338S525 314 586 351S783 434 910 341S1088 290 1241 247"
          />
        </circle>
      </g>
    </svg>
  );
}
