"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Canvas } from "@react-three/fiber";
import { useProgress } from "@react-three/drei";
import * as THREE from "three";
import type { Painting, Room } from "@/lib/painting";
import { Scene, createNav } from "./Scene";
import { hangRoom, type Hung } from "./layout";
import { PaintingPanel } from "./PaintingPanel";
import { sfx } from "@/lib/sound";
import { ControlsBar } from "./ControlsBar";
import { StylePicker, StylePanel, type RoomLook } from "./StylePicker";
import {
  BottomSheet, HelpBody, MobileDock, MobileTip, MusicSheetBody, RoomsList, TourBar, useIsPhone, useTip, type Sheet,
} from "./Mobile";
import { MusicBarItem, MusicTracks } from "@/components/MusicPlayer";
import type { Track } from "@/lib/painting";
import { HiveMark } from "@/components/members/HiveMark";

/**
 * The walk-through gallery. `app` mode runs inside the members app: no site
 * header, HUD lifted above the app's tab bar, links stay inside the app.
 */
const noop = () => {};

export function Gallery({ rooms, app = false, isAdmin = false, tracks }: { rooms: Room[]; app?: boolean; isAdmin?: boolean; tracks?: Track[] }) {
  const base = app ? "/members" : "";
  // In the app the gallery takes the whole screen: the app's own menu steps
  // aside here (see TabBar), so there's only ever one menu — the gallery's.
  const tabBar = 0;
  const [dockOpen, setDockOpen] = useState(false);
  const nav = useRef(createNav());
  const [entered, setEntered] = useState(false);
  const [curtainGone, setCurtainGone] = useState(false); // the entry screen plays its exit after you step in
  const hideCurtain = useCallback(() => setCurtainGone(true), []);
  const [roomIndex, setRoomIndex] = useState(0);
  const [fading, setFading] = useState(false);
  const [selected, setSelected] = useState<Painting | null>(null);
  const [hovered, setHovered] = useState<Painting | null>(null);
  const phone = useIsPhone();
  const [sheet, setSheet] = useState<Sheet>(null);
  const [tour, setTour] = useState(-1); // which work the phone tour is on (-1 = not started)
  const tip = useTip();

  // phone tour: the ‹ › arrows stay hidden so the painting is clear; a tap on the screen brings them back for a few seconds
  const [arrows, setArrows] = useState(false);
  const arrowTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const flashArrows = useCallback(() => {
    setArrows(true);
    if (arrowTimer.current) clearTimeout(arrowTimer.current);
    arrowTimer.current = setTimeout(() => setArrows(false), 3500);
  }, []);
  useEffect(() => () => { if (arrowTimer.current) clearTimeout(arrowTimer.current); }, []);
  const down = useRef<{ x: number; y: number; t: number } | null>(null);
  const onPointerDown = (e: React.PointerEvent) => { down.current = { x: e.clientX, y: e.clientY, t: Date.now() }; };
  const onPointerUp = (e: React.PointerEvent) => {
    const d = down.current;
    down.current = null;
    if (!d || !phone) return;
    if (Math.hypot(e.clientX - d.x, e.clientY - d.y) < 10 && Date.now() - d.t < 350) flashArrows();
  };

  // Enter: honour deep links like /gallery?room=slug, and ?room=slug&work=slug to go straight back to a work
  const [pendingWork, setPendingWork] = useState<string | null>(null);
  const params = useSearchParams();
  const [deepLink] = useState(() => ({ room: params.get("room"), work: params.get("work") }));
  const returning = !!deepLink.work;
  const enter = useCallback(() => {
    const i = rooms.findIndex((r) => r.slug === deepLink.room);
    if (i >= 0) setRoomIndex(i);
    setPendingWork(deepLink.work);
    sfx.unlock();
    sfx.play("open");
    setEntered(true);
  }, [rooms, deepLink]);

  // looks being tried in the Style picker, per room (only for this visitor until an admin saves)
  const [lookOverride, setLookOverride] = useState<Record<string, Partial<RoomLook>>>({});
  const baseRoom = rooms[roomIndex];
  const preview = baseRoom ? lookOverride[baseRoom.id] : undefined;
  const room = baseRoom && preview ? { ...baseRoom, ...preview } : baseRoom;

  const goToRoom = useCallback(
    (i: number) => {
      if (i === roomIndex || i < 0 || i >= rooms.length) return;
      setSelected(null);
      setSheet(null);
      setTour(-1);
      sfx.play("door");
      setFading(true);
      setTimeout(() => {
        setRoomIndex(i);
        history.replaceState(null, "", `?room=${rooms[i].slug}`);
        setTimeout(() => setFading(false), 120);
      }, 450);
    },
    [roomIndex, rooms],
  );

  const onSelect = useCallback(
    (p: Painting, hung: Hung) => {
      nav.current.focus = { position: new THREE.Vector3(...hung.viewPosition), yaw: hung.viewYaw };
      nav.current.walkTarget = null;
      sfx.play("click");
      setSelected(p);
      // remember the open work in the address, so Back from its page returns here
      const q = new URLSearchParams(location.search);
      if (p.collectionSlug) q.set("room", p.collectionSlug);
      q.set("work", p.slug);
      history.replaceState(null, "", `?${q}`);
    },
    [nav],
  );

  const walkTo = useCallback((to: THREE.Vector3) => {
    nav.current.walkTarget = to;
    nav.current.focus = null;
  }, []);

  const closePanel = useCallback(() => {
    nav.current.focus = null;
    setSelected(null);
    const q = new URLSearchParams(location.search);
    if (q.has("work")) { q.delete("work"); history.replaceState(null, "", `?${q}`); }
  }, [nav]);

  // phone: glide painting to painting
  const hung = useMemo(() => (baseRoom ? hangRoom(baseRoom) : []), [baseRoom]);
  const step = useCallback(
    (d: 1 | -1) => {
      if (!hung.length) return;
      const i = tour < 0 ? (d === 1 ? 0 : hung.length - 1) : (tour + d + hung.length) % hung.length;
      const h = hung[i];
      // stand as close as the screen allows, so the work fills a phone screen
      const aspect = window.innerWidth / window.innerHeight;
      const vfov = THREE.MathUtils.degToRad(aspect < 0.8 ? 88 : aspect < 1.2 ? 74 : 62);
      const hfov = 2 * Math.atan(Math.tan(vfov / 2) * aspect);
      const dist = THREE.MathUtils.clamp((h.width + 0.7) / (2 * Math.tan(hfov / 2)), 1.4, 2.9);
      const wallX = h.position[0];
      const pos = new THREE.Vector3(wallX - Math.sign(wallX) * dist, h.viewPosition[1], h.viewPosition[2]);
      nav.current.focus = { position: pos, yaw: h.viewYaw };
      nav.current.walkTarget = null;
      sfx.play("step", "hard");
      setTour(i);
      setSelected((cur) => (cur ? h.painting : cur)); // swiping with the story open moves the story on too
      tip.dismiss();
    },
    [hung, tour, tip],
  );
  const onFlick = useCallback((d: 1 | -1) => step(d), [step]);

  // coming back from a work's page: glide to that work and reopen it
  useEffect(() => {
    if (!entered || !pendingWork) return;
    const i = hung.findIndex((h) => h.painting.slug === pendingWork);
    const t = setTimeout(() => {
      setPendingWork(null);
      if (i < 0) return;
      setTour(i);
      onSelect(hung[i].painting, hung[i]);
    }, 350); // after the room has spawned the camera at its entrance
    return () => clearTimeout(t);
  }, [entered, pendingWork, hung, onSelect]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && closePanel();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [closePanel]);

  if (!room) {
    return <div className="grid h-dvh place-items-center bg-ink text-cream">The gallery is being hung. Come back soon.</div>;
  }

  return (
    <div className="hive-app fixed inset-0 overflow-hidden bg-ink text-cream select-none" onPointerDownCapture={onPointerDown} onPointerUpCapture={onPointerUp}>
      <Canvas
        dpr={[1, 1.75]}
        camera={{ fov: 62, near: 0.05, far: 60, position: [0, 1.65, -2.2] }}
        gl={{ antialias: true, powerPreference: "high-performance" }}
        style={{ touchAction: "none" }}
      >
        <Scene
          room={room}
          frameOverride={preview?.frameStyle ?? null}
          prevRoom={rooms[roomIndex - 1] ?? null}
          nextRoom={rooms[roomIndex + 1] ?? null}
          nav={nav}
          paused={!entered}
          selectedSlug={selected?.slug ?? null}
          onSelect={onSelect}
          onHover={setHovered}
          onDoor={(d) => goToRoom(roomIndex + d)}
          onFirstMove={noop}
          onWalk={walkTo}
          onFlick={phone ? onFlick : undefined}
        />
      </Canvas>

      {/* room-change fade */}
      <div className={`pointer-events-none absolute inset-0 bg-ink transition-opacity duration-500 ${fading ? "opacity-100" : "opacity-0"}`} />

      {/* top bar */}
      <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between p-5 md:p-7">
        <Link href={app ? "/members" : "/"} className="pointer-events-auto font-title text-2xl font-light tracking-tight transition-colors hover:text-honey">
          {app ? <HiveMark /> : <span className="font-hand text-3xl">Jane Bee</span>}
        </Link>
        {phone ? (
          <button onClick={() => setSheet("rooms")} className="pointer-events-auto max-w-[55vw] text-right">
            <span className="block text-[10px] tracking-[0.2em] text-honey uppercase">Room {roomIndex + 1} of {rooms.length}</span>
            <span className="block truncate font-serif text-2xl leading-tight">{room.name} ▾</span>
          </button>
        ) : (
          <RoomMap rooms={rooms} current={roomIndex} onPick={goToRoom} />
        )}
      </div>

      {/* hover glimpse (desktop) */}
      {!phone && <div
        style={{ bottom: tabBar + 110 }}
        className={`pointer-events-none absolute inset-x-0 text-center transition-all duration-500 ${hovered && !selected ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"}`}
      >
        <p className="font-serif text-xl font-light italic md:text-2xl">{hovered?.glimpse ?? ""}</p>
        <p className="mt-1 text-xs tracking-[0.2em] uppercase opacity-70">{hovered?.title ?? ""}</p>
      </div>}

      {/* room counter */}
      {!phone && <div key={room.id} className="animate-rise pointer-events-none absolute top-16 left-5 md:top-[4.5rem] md:left-7">
        <span className="block text-[11px] tracking-[0.18em] uppercase opacity-60">
          Room {roomIndex + 1} / {rooms.length} · {room.paintings.length} works
        </span>
        <span className="mt-1 block max-w-[40vw] font-serif text-4xl leading-none font-light drop-shadow-[0_2px_12px_rgba(0,0,0,0.6)] lg:text-5xl">{room.name}</span>
      </div>}

      {entered && !selected && phone && (
        <>
          <TourBar
            bottom={tabBar}
            painting={tour >= 0 ? hung[tour]?.painting ?? null : null}
            index={tour}
            total={hung.length}
            onStep={(d) => { step(d); flashArrows(); }}
            arrows={arrows}
            onOpen={() => { const h = hung[tour]; if (h) onSelect(h.painting, h); }}
          />
          <MobileDock bottom={tabBar} open={sheet} onOpen={setSheet} homeHref={app ? "/members" : "/"} expanded={dockOpen || !!sheet} onExpand={setDockOpen} />
          {sheet === "rooms" && (
            <BottomSheet title="Rooms" bottom={tabBar} onClose={() => setSheet(null)}>
              <RoomsList rooms={rooms} current={roomIndex} onPick={(i) => { setSheet(null); goToRoom(i); }} />
            </BottomSheet>
          )}
          {sheet === "style" && (
            <BottomSheet title="Room style" bottom={tabBar} onClose={() => setSheet(null)}>
              <StylePanel
                key={room.id}
                roomId={room.id}
                saved={lookOf(baseRoom)}
                current={lookOf(room)}
                canSave={isAdmin}
                listClass="max-h-[38dvh]"
                onPreview={(l) => setLookOverride((o) => ({ ...o, [room.id]: { ...o[room.id], ...l } }))}
              />
            </BottomSheet>
          )}
          {sheet === "music" && (
            <BottomSheet title="Music" bottom={tabBar} onClose={() => setSheet(null)}>
              <MusicSheetBody isAdmin={isAdmin} />
            </BottomSheet>
          )}
          {sheet === "info" && (
            <BottomSheet title="Getting around" bottom={tabBar} onClose={() => setSheet(null)}>
              <HelpBody />
            </BottomSheet>
          )}
          {tip.show && <MobileTip onDismiss={tip.dismiss} />}
        </>
      )}

      {entered && !selected && !phone && (
        <ControlsBar
          homeHref={app ? "/members" : "/"}
          bottomOffset={tabBar}
          extra={
            <>
              <StylePicker
                key={room.id}
                roomId={room.id}
                saved={lookOf(baseRoom)}
                current={lookOf(room)}
                canSave={isAdmin}
                onPreview={(l) => setLookOverride((o) => ({ ...o, [room.id]: { ...o[room.id], ...l } }))}
              />
              <MusicBarItem isAdmin={isAdmin} />
            </>
          }
        />
      )}

      {selected && <PaintingPanel painting={selected} onClose={closePanel} base={base} bottomOffset={tabBar} />}

      {tracks && <MusicTracks tracks={tracks} />}
      {!curtainGone && <EnterScreen rooms={rooms} onEnter={enter} leaving={entered} onGone={hideCurtain} auto={returning} phone={phone} />}
    </div>
  );
}

const lookOf = (r: Room): RoomLook => ({ floorStyle: r.floorStyle, wallStyle: r.wallStyle, wallColour: r.wallColour, frameStyle: r.frameStyle, honeycomb: r.honeycomb });

function RoomMap({ rooms, current, onPick }: { rooms: Room[]; current: number; onPick: (i: number) => void }) {
  return (
    <nav aria-label="Rooms" className="pointer-events-auto text-right">
      <ol className="space-y-1.5">
        {rooms.map((r, i) => (
          <li key={r.id}>
            <button
              onClick={() => onPick(i)}
              className={`group inline-flex items-center gap-2 text-xs tracking-[0.15em] uppercase transition-opacity ${i === current ? "opacity-100" : "opacity-50 hover:opacity-90"}`}
            >
              <span>{r.name}</span>
              <span className={`inline-block h-2 w-2 rounded-full ${i === current ? "bg-honey" : "bg-cream/60"}`} />
            </button>
          </li>
        ))}
      </ol>
    </nav>
  );
}

/**
 * The way in: drifting walls of Jane's work behind a big, cheeky invitation.
 * Loading fills a honey line; once ready, "Step inside" opens two black doors onto the room.
 */
function EnterScreen({
  rooms, onEnter, leaving, onGone, auto = false, phone,
}: { rooms: Room[]; onEnter: () => void; leaving: boolean; onGone: () => void; auto?: boolean; phone: boolean }) {
  const { progress, active } = useProgress();
  const ready = !active || progress >= 100;
  const btn = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!ready) return;
    if (auto) { onEnter(); return; } // returning to a work: no need to press Enter again
    // Enter or Space steps inside, without focusing the button (focus drew a blue box round it)
    const k = (e: KeyboardEvent) => { if ((e.key === "Enter" || e.key === " ") && document.activeElement === document.body) { e.preventDefault(); onEnter(); } };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [ready, auto, onEnter]);
  useEffect(() => {
    if (!leaving) return;
    if (auto) { onGone(); return; }
    const t = setTimeout(onGone, 1500);
    return () => clearTimeout(t);
  }, [leaving, auto, onGone]);

  const works = useMemo(() => rooms.flatMap((r) => r.paintings).filter((p) => p.image), [rooms]);
  const strips = useMemo(() => {
    if (!works.length) return [];
    const row = (offset: number) => Array.from({ length: 10 }, (_, i) => works[(i * 3 + offset) % works.length]);
    return [row(0), row(1), row(2)];
  }, [works]);
  const total = rooms.reduce((n, r) => n + r.paintings.length, 0);

  if (auto && leaving) return null;

  return (
    <div className={`enter-screen absolute inset-0 z-20 overflow-hidden ${leaving ? "is-leaving pointer-events-none" : ""}`}>
      {/* the doors */}
      <div className="enter-door enter-door-l absolute inset-y-0 left-0 w-1/2 bg-ink" />
      <div className="enter-door enter-door-r absolute inset-y-0 right-0 w-1/2 bg-ink" />

      <div className="enter-content absolute inset-0">
        {/* drifting walls of work */}
        <div className="pointer-events-none absolute inset-[-20%] flex rotate-[-8deg] flex-col justify-center gap-6 opacity-40" aria-hidden>
          {strips.map((row, r) => (
            <div key={r} className="flex w-max gap-6 enter-strip" style={{ animationDuration: `${70 + r * 25}s`, animationDirection: r % 2 ? "reverse" : "normal" }}>
              {[...row, ...row].map((p, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={i} src={p.image!} alt="" className="h-44 w-auto shrink-0 object-cover grayscale-[40%] md:h-64" loading="lazy" />
              ))}
            </div>
          ))}
        </div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0.55)_0%,rgba(0,0,0,0.92)_60%,#000_100%)]" />
        <span className="pointer-events-none absolute top-1/2 left-1/2 h-[40rem] w-[40rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-honey/10 blur-3xl" />

        <div className="relative grid h-full place-items-center px-6 text-center">
          <div className="max-w-4xl">
            <p className="enter-in text-[11px] tracking-[0.4em] text-honey uppercase" style={{ animationDelay: "0.1s" }}>Jane Bee · The gallery</p>
            <h2 className="mt-6 font-title text-[17vw] leading-[0.85] font-light tracking-tight md:text-[10rem]">
              <span className="enter-in block" style={{ animationDelay: "0.25s" }}>Come</span>
              <span className="enter-in block italic text-honey" style={{ animationDelay: "0.45s" }}>closer.</span>
            </h2>
            <p className="enter-in mx-auto mt-8 max-w-md text-base text-white/75 md:text-lg" style={{ animationDelay: "0.7s" }}>
              {rooms.length} {rooms.length === 1 ? "room" : "rooms"}. {total} works. Every one holds a memory — and a few of them hold secrets.
            </p>
            <p className="enter-in mt-5 text-[11px] tracking-[0.25em] text-white/45 uppercase" style={{ animationDelay: "0.8s" }}>
              {rooms.map((r) => r.name).join("  ·  ")}
            </p>

            <div className="enter-in mt-10 flex flex-col items-center gap-5" style={{ animationDelay: "0.95s" }}>
              {ready ? (
                <button
                  ref={btn}
                  onClick={onEnter}
                  className="enter-cta group relative inline-flex items-center gap-4 bg-honey px-12 py-5 text-sm font-semibold tracking-[0.3em] text-black uppercase transition-transform hover:scale-[1.04]"
                >
                  Step inside <span className="text-lg transition-transform duration-300 group-hover:translate-x-1.5">→</span>
                </button>
              ) : (
                <div className="w-64">
                  <div className="h-[2px] w-full overflow-hidden bg-white/15">
                    <div className="h-full bg-honey transition-[width] duration-300" style={{ width: `${Math.round(progress)}%` }} />
                  </div>
                  <p className="mt-3 text-[11px] tracking-[0.3em] text-white/60 uppercase tabular-nums">Hanging the pictures · {Math.round(progress)}%</p>
                </div>
              )}
              <p className="text-xs text-white/45">
                {phone ? "Drag to look around · tap the floor to walk · tap a painting" : "W A S D or arrows to walk · drag to look · click a painting"} · sound on 🔊
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
