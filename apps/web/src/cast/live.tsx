import { useEffect, useId, useLayoutEffect, useRef } from 'react';
import { PROP_DEFS, PROP_OF, HandArt, PropArt } from './props';
import { EYE_R, PUPIL_R, GLOSS, REST, insertDefs, type CastId } from './rest';
import { addActor, ensemble, perform, castLook, removeActor, type Actor } from './director';
import type { Expression } from './rig';

// The lazy half of a character: the live face and prop layers, registered with the director. Everything here is in the cast chunk, so nothing heavy lands in the first download.

export { perform, ensemble, castLook };

export interface LiveProps {
  who: CastId;
  expression: Expression;
  prop: boolean | 'parcel';
  track: boolean;
  peek: boolean;
  interactive: boolean;
  onActor: (actor: Actor | null) => void;
}

const uid = (raw: string) => `k${raw.replace(/[^a-zA-Z0-9]/g, '')}`;

const zGlyph = 'M-6.5-7.5H6.5L-6.5 7.5H6.5';

/** The live face. React renders the empty structure once; the director owns every attribute from then on. */
export function LiveFace({ who, expression, prop, track, peek, interactive, onActor }: LiveProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const propRef = useRef<SVGSVGElement>(null);
  const actorRef = useRef<Actor | null>(null);
  const clip = uid(useId());
  const g = GLOSS[who];
  const zx = REST[who].eyes[1].x + 42;
  const zy = REST[who].eyes[1].y - 40;

  useLayoutEffect(() => {
    insertDefs('props', PROP_DEFS);
    // Found from its own svg, not from the parent's ref: when the rig has already loaded, this runs in the first commit, before a parent's ref is attached.
    const el = svgRef.current?.closest<HTMLElement>('.k-char');
    if (!el || !svgRef.current) return;
    const actor = addActor({
      who,
      root: el,
      svg: svgRef.current,
      propSvg: propRef.current,
      propKind: prop === 'parcel' ? 'parcel' : PROP_OF[who],
      expression,
      prop: Boolean(prop),
      track,
      peek,
      interactive,
    });
    actorRef.current = actor;
    onActor(actor);
    return () => {
      removeActor(actor);
      actorRef.current = null;
      onActor(null);
    };
    // A new character is a new actor. Everything else is forwarded below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [who]);

  useEffect(() => actorRef.current?.setBase(expression), [expression]);
  useEffect(() => actorRef.current?.setOptions(track, Boolean(prop)), [track, prop]);

  return (
    <>
      <svg ref={svgRef} className="k-face" viewBox="0 0 480 480" aria-hidden focusable="false">
        <defs>
          <clipPath id={clip}>
            <circle r={EYE_R} />
          </clipPath>
        </defs>
        <ellipse data-part="gloss" cx={g.cx} cy={g.cy} rx={g.rx} ry={g.ry} transform={`rotate(${g.rot} ${g.cx} ${g.cy})`} fill="url(#k-gloss)" />
        <g data-part="face">
          {[0, 1].map((i) => (
            <g key={i}>
              <path data-part={`eye${i}-line`} className="k-is" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              <g data-part={`eye${i}-ball`}>
                <circle r={EYE_R} fill="url(#k-sclera)" />
                <g clipPath={`url(#${clip})`}>
                  <ellipse cy={-EYE_R * 0.92} rx={EYE_R * 1.1} ry={EYE_R * 0.55} fill="#3a3460" opacity=".14" />
                  <g data-part={`eye${i}-pupil`}>
                    <circle r={PUPIL_R} className="k-if" />
                    <circle cx="-3.1" cy="-3.5" r="3.1" fill="#fff" />
                    <circle cx="3.3" cy="3.4" r="1.25" fill="#fff" opacity=".85" />
                  </g>
                  <g data-part={`eye${i}-lid`} opacity="0">
                    <rect x={-EYE_R - 2} y={-EYE_R - 2} width={2 * EYE_R + 4} height={2 * EYE_R + 2} fill={`url(#k-lid-${who})`} />
                    <path d={`M${-EYE_R - 2} ${EYE_R}H${EYE_R + 2}`} className="k-is" strokeWidth="5" strokeLinecap="round" />
                  </g>
                </g>
              </g>
            </g>
          ))}
          <path data-part="brow0" className="k-is" fill="none" strokeWidth="7.5" strokeLinecap="round" opacity="0" />
          <path data-part="brow1" className="k-is" fill="none" strokeWidth="7.5" strokeLinecap="round" opacity="0" />
          <path data-part="mouth" className="k-if k-is" strokeLinecap="round" strokeLinejoin="round" />
          <g data-part="z" opacity="0" style={{ display: 'none' }}>
            <path d={zGlyph} className="k-is" fill="none" strokeWidth="4.6" strokeLinecap="round" strokeLinejoin="round" transform={`translate(${zx} ${zy})`} />
            <path d={zGlyph} className="k-is" fill="none" strokeWidth="5.6" strokeLinecap="round" strokeLinejoin="round" transform={`translate(${zx + 26} ${zy - 26}) scale(.68)`} />
          </g>
        </g>
      </svg>
      <svg ref={propRef} className="k-prop" viewBox="0 0 480 480" aria-hidden focusable="false">
        <PropArt kind={prop === 'parcel' ? 'parcel' : PROP_OF[who]} who={who} />
        <HandArt who={who} />
      </svg>
    </>
  );
}
