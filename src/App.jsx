import React, { useMemo, useState, Suspense, lazy } from 'react';
import {
  MODES, SLOTS, PACKAGES, BUSINESSES, COUNTRIES, MOCK_BOOKINGS, YEAR, MONTH,
  isTaken, freeCount, slotLabel, fmt, dayLabel,
} from './data.js';
const Globe = lazy(() => import('./Globe.jsx'));

const STEPS = ['Type de live', 'Date', 'Heure', 'Forfait', 'Tes infos', 'Confirmation'];
const EMPTY = { mode: null, day: null, slot: null, pack: null, info: { name: '', shop: '', business: '', products: '', phone: '', email: '', city: '', country: 'Togo', note: '' }, pay: 'momo' };

function Logo() {
  return (
    <span className="logo" aria-label="OCD Live">
      <b>OCD</b><span>Live</span>
    </span>
  );
}

function Header({ view, go, newCount }) {
  return (
    <header className="top">
      <button className="linkish" onClick={() => go('home')}><Logo /></button>
      <nav>
        <button className={view === 'home' ? 'on' : ''} onClick={() => go('home')}>Accueil</button>
        <button className={view === 'booking' ? 'on' : ''} onClick={() => go('booking')}>Réserver</button>
        <button className={view === 'admin' ? 'on' : ''} onClick={() => go('admin')}>
          Espace équipe{newCount > 0 && <i className="badge">{newCount}</i>}
        </button>
      </nav>
    </header>
  );
}

/* ---------------- Accueil ---------------- */
function Home({ start, openJob }) {
  return (
    <>
      <section className="hero">
        <div className="hero-copy">
          <p className="kicker"><span className="dot" /> Lives dès le 1er décembre · Lomé</p>
          <h1>Viens vendre <em>en live</em> avec OCD Live.</h1>
          <p className="lead">1h30 devant la caméra, une régie qui dirige ton live, tes produits et ton numéro vus par toute l’Afrique. Le marketing d’abord, la vente ensuite.</p>
          <div className="modes">
            {MODES.map((m) => (
              <button key={m.id} className={'mode-card ' + m.id} onClick={() => start(m.id)}>
                <span className="mode-ic" aria-hidden="true">{m.id === 'presentiel' ? '◉' : '⟟'}</span>
                <span className="mode-t">{m.title}</span>
                <span className="mode-p">{m.place}</span>
                <span className="mode-go">Choisir →</span>
              </button>
            ))}
          </div>
        </div>
        <Suspense fallback={<div className="globe" />}><Globe className="globe" /></Suspense>
        <p className="globe-cap">Glisse pour tourner · les lives partent du studio de Lomé</p>
      </section>

      <section className="band">
        <div className="wrap">
          <h2>Comment ça marche</h2>
          <ol className="how">
            <li><b>Choisis</b><span>Présentiel au studio, ou à distance depuis ton pays.</span></li>
            <li><b>Réserve</b><span>Un jour de décembre et un créneau de 1h30.</span></li>
            <li><b>Prends ton forfait</b><span>Un live, un pack, ou une annonce par Bovann.</span></li>
            <li><b>Passe en live</b><span>On te confirme par WhatsApp et on t’attend.</span></li>
          </ol>
        </div>
      </section>

      <section className="wrap packs-preview">
        <div className="sec-head"><h2>Les forfaits</h2><button className="btn" onClick={() => start(null)}>Réserver mon live</button></div>
        <div className="pack-grid">
          {PACKAGES.map((p) => <PackCard key={p.id} p={p} onPick={() => start(null)} />)}
        </div>
      </section>

      <section className="wrap job">
        <div>
          <p className="kicker">On recrute à Lomé</p>
          <h2>Animatrice live, à temps plein</h2>
          <p>Tu es présentable, tu sais parler et tu sais vendre ? Tu accompagneras depuis le studio les commerçants qui font leur live à distance, du Cameroun au Tchad. Pas besoin de diplôme : il faut être éloquente et vivre au Togo.</p>
        </div>
        <button className="btn dark" onClick={openJob}>Postuler</button>
      </section>
    </>
  );
}

function PackCard({ p, selected, onPick }) {
  const per = Math.round(p.price / p.lives);
  return (
    <button className={'pack' + (selected ? ' sel' : '') + (p.bovann ? ' boost' : '')} onClick={onPick} aria-pressed={!!selected}>
      {p.tag && <span className="pack-tag">{p.tag}</span>}
      <span className="pack-n">{p.name}</span>
      <span className="pack-price">{fmt(p.price)}</span>
      <span className="pack-per">{p.lives > 1 ? `${p.lives} lives · ${fmt(per)} le live` : '1 live de 1h30'}</span>
      <ul>{p.features.map((f) => <li key={f}>{f}</li>)}</ul>
    </button>
  );
}

/* ---------------- Réservation ---------------- */
function Stepper({ step, setStep, max }) {
  return (
    <ol className="stepper">
      {STEPS.map((s, i) => (
        <li key={s} className={i === step ? 'on' : i < step ? 'done' : ''}>
          <button disabled={i > max} onClick={() => setStep(i)}><i>{i < step ? '✓' : i + 1}</i><span>{s}</span></button>
        </li>
      ))}
    </ol>
  );
}

function Calendar({ value, onPick }) {
  const first = new Date(YEAR, MONTH, 1);
  const days = new Date(YEAR, MONTH + 1, 0).getDate();
  const lead = (first.getDay() + 6) % 7;
  const cells = [...Array(lead).fill(null), ...Array.from({ length: days }, (_, i) => i + 1)];
  return (
    <div className="cal">
      <div className="cal-head"><b>Décembre {YEAR}</b><span className="legend"><i className="l ok" />Libre <i className="l few" />Presque plein <i className="l full" />Complet</span></div>
      <div className="cal-grid">
        {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((d) => <span key={d} className="dow">{d}</span>)}
        {cells.map((d, i) => {
          if (!d) return <span key={'x' + i} />;
          const free = freeCount(d);
          const cls = free === 0 ? 'full' : free <= 3 ? 'few' : 'ok';
          return (
            <button key={d} className={'day ' + cls + (value === d ? ' sel' : '')} disabled={free === 0} onClick={() => onPick(d)}
              aria-label={`${dayLabel(d)}, ${free} créneaux libres`}>
              <b>{d}</b><small>{free ? `${free} libres` : 'complet'}</small>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Field({ label, children, error, hint }) {
  return (
    <label className={'field' + (error ? ' err' : '')}>
      <span>{label}</span>{children}
      {error ? <em>{error}</em> : hint ? <small>{hint}</small> : null}
    </label>
  );
}

function Booking({ b, setB, step, setStep, onConfirm }) {
  const [errors, setErrors] = useState({});
  const pack = PACKAGES.find((p) => p.id === b.pack);
  const max = !b.mode ? 0 : !b.day ? 1 : !b.slot ? 2 : !b.pack ? 3 : 5;
  const setInfo = (k, v) => setB({ ...b, info: { ...b.info, [k]: v } });

  const validate = () => {
    const e = {}, I = b.info;
    if (!I.name.trim()) e.name = 'Indique ton nom.';
    if (!I.shop.trim()) e.shop = 'Indique le nom de ta boutique ou marque.';
    if (!I.business) e.business = 'Choisis ton activité.';
    if (!I.products.trim()) e.products = 'Dis-nous ce que tu vas présenter.';
    if (I.phone.replace(/\D/g, '').length < 8) e.phone = 'Numéro WhatsApp incomplet.';
    if (!I.city.trim()) e.city = 'Indique ta ville ou ton adresse.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  return (
    <div className="booking wrap">
      <Stepper step={step} setStep={setStep} max={max} />
      <div className="book-grid">
        <div className="panel">
          {step === 0 && (
            <>
              <h2>Tu veux faire ton live comment ?</h2>
              <div className="mode-big">
                {MODES.map((m) => (
                  <button key={m.id} className={'mode-opt' + (b.mode === m.id ? ' sel' : '')} onClick={() => { setB({ ...b, mode: m.id }); setStep(1); }}>
                    <span className="mode-t">{m.title}</span><span className="mode-p">{m.place}</span>
                    <span className="mode-txt">{m.text}</span>
                    <ul>{m.points.map((p) => <li key={p}>{p}</li>)}</ul>
                  </button>
                ))}
              </div>
            </>
          )}
          {step === 1 && (
            <>
              <h2>Choisis ton jour</h2>
              <p className="sub">Les lives commencent le 1er décembre. Chaque jour propose des créneaux de 1h30.</p>
              <Calendar value={b.day} onPick={(d) => { setB({ ...b, day: d, slot: null }); setStep(2); }} />
            </>
          )}
          {step === 2 && (
            <>
              <h2>Choisis ton heure</h2>
              <p className="sub">{dayLabel(b.day)} · live de 1h30</p>
              <div className="slots">
                {SLOTS.map((s, i) => {
                  const taken = isTaken(b.day, i);
                  return (
                    <button key={s} className={'slot' + (b.slot === s ? ' sel' : '')} disabled={taken} onClick={() => { setB({ ...b, slot: s }); setStep(3); }}>
                      <b>{slotLabel(s)}</b><small>{taken ? 'Déjà réservé' : 'Disponible'}</small>
                    </button>
                  );
                })}
              </div>
              <button className="btn ghost" onClick={() => setStep(1)}>← Changer de jour</button>
            </>
          )}
          {step === 3 && (
            <>
              <h2>Choisis ton forfait</h2>
              <p className="sub">Pour les packs, ton premier live est le {dayLabel(b.day)}. On cale les suivants avec toi.</p>
              <div className="pack-grid">
                {PACKAGES.map((p) => <PackCard key={p.id} p={p} selected={b.pack === p.id} onPick={() => { setB({ ...b, pack: p.id }); setStep(4); }} />)}
              </div>
            </>
          )}
          {step === 4 && (
            <form className="form" onSubmit={(e) => { e.preventDefault(); if (validate()) setStep(5); }} noValidate>
              <h2>Parle-nous de ton business</h2>
              <p className="sub">Ton numéro et ton adresse seront affichés pendant le live pour que les clients te retrouvent.</p>
              <div className="f2">
                <Field label="Nom complet" error={errors.name}><input id="f-name" value={b.info.name} onChange={(e) => setInfo('name', e.target.value)} placeholder="Ex. Ama Kodjo" /></Field>
                <Field label="Nom de la boutique ou marque" error={errors.shop}><input id="f-shop" value={b.info.shop} onChange={(e) => setInfo('shop', e.target.value)} placeholder="Ex. Chez Ama Délices" /></Field>
                <Field label="Ton activité" error={errors.business}>
                  <select id="f-biz" value={b.info.business} onChange={(e) => setInfo('business', e.target.value)}>
                    <option value="">Choisir…</option>{BUSINESSES.map((x) => <option key={x}>{x}</option>)}
                  </select>
                </Field>
                <Field label="Numéro WhatsApp" error={errors.phone}><input id="f-phone" inputMode="tel" value={b.info.phone} onChange={(e) => setInfo('phone', e.target.value)} placeholder="+228 90 00 00 00" /></Field>
                {b.mode === 'distance' && (
                  <Field label="Pays d’où tu fais le live">
                    <select id="f-country" value={b.info.country} onChange={(e) => setInfo('country', e.target.value)}>{COUNTRIES.map((c) => <option key={c}>{c}</option>)}</select>
                  </Field>
                )}
                <Field label="Ville et adresse de la boutique" error={errors.city}><input id="f-city" value={b.info.city} onChange={(e) => setInfo('city', e.target.value)} placeholder="Ex. Lomé, Bè Kpota" /></Field>
                <Field label="E-mail (facultatif)"><input id="f-email" type="email" value={b.info.email} onChange={(e) => setInfo('email', e.target.value)} placeholder="toi@exemple.com" /></Field>
              </div>
              <Field label="Produits que tu vas présenter" error={errors.products} hint="Ex. jus naturels, tenues en wax, téléphones reconditionnés…">
                <textarea id="f-products" rows="3" value={b.info.products} onChange={(e) => setInfo('products', e.target.value)} />
              </Field>
              <Field label="Un message pour la régie (facultatif)"><textarea id="f-note" rows="2" value={b.info.note} onChange={(e) => setInfo('note', e.target.value)} /></Field>
              <div className="row"><button type="button" className="btn ghost" onClick={() => setStep(3)}>← Forfaits</button><button className="btn">Voir le récapitulatif →</button></div>
            </form>
          )}
          {step === 5 && (
            <>
              <h2>Vérifie et confirme</h2>
              <dl className="recap">
                <dt>Live</dt><dd>{MODES.find((m) => m.id === b.mode).title}{b.mode === 'distance' ? ` · depuis ${b.info.country}` : ' · Studio OCD Live, Lomé'}</dd>
                <dt>Date</dt><dd>{dayLabel(b.day)}, {slotLabel(b.slot)}</dd>
                <dt>Forfait</dt><dd>{pack.name} · {fmt(pack.price)}</dd>
                <dt>Business</dt><dd>{b.info.shop} · {b.info.business}</dd>
                <dt>Produits</dt><dd>{b.info.products}</dd>
                <dt>Contact</dt><dd>{b.info.name} · {b.info.phone} · {b.info.city}</dd>
              </dl>
              <fieldset className="pay">
                <legend>Paiement</legend>
                <label><input type="radio" name="pay" checked={b.pay === 'momo'} onChange={() => setB({ ...b, pay: 'momo' })} /> Mobile Money</label>
                {b.mode === 'presentiel' && <label><input type="radio" name="pay" checked={b.pay === 'studio'} onChange={() => setB({ ...b, pay: 'studio' })} /> Payer au studio le jour du live</label>}
                <small>Maquette : aucun paiement réel n’est effectué.</small>
              </fieldset>
              <div className="row"><button className="btn ghost" onClick={() => setStep(4)}>← Modifier</button><button className="btn" onClick={onConfirm}>Confirmer ma réservation</button></div>
            </>
          )}
        </div>

        <aside className="summary">
          <h3>Ta réservation</h3>
          <dl>
            <dt>Type</dt><dd>{b.mode ? MODES.find((m) => m.id === b.mode).title : '—'}</dd>
            <dt>Jour</dt><dd>{b.day ? dayLabel(b.day) : '—'}</dd>
            <dt>Heure</dt><dd>{b.slot ? slotLabel(b.slot) : '—'}</dd>
            <dt>Forfait</dt><dd>{pack ? pack.name : '—'}</dd>
          </dl>
          <div className="total"><span>Total</span><b>{pack ? fmt(pack.price) : '—'}</b></div>
          {b.mode === 'distance' && <p className="note">Une animatrice OCD Live t’accompagne depuis le studio pendant tout ton live.</p>}
        </aside>
      </div>
    </div>
  );
}

/* ---------------- Confirmation ---------------- */
function Confirmed({ bk, again, toAdmin }) {
  const where = bk.mode === 'distance' ? `à distance depuis ${bk.country}` : 'en présentiel au studio de Lomé';
  return (
    <div className="wrap confirmed">
      <div className="ok-head">
        <span className="tick" aria-hidden="true">✓</span>
        <div><h2>C’est réservé, {bk.name.split(' ')[0]} !</h2><p>Référence <b>{bk.ref}</b>. L’équipe OCD Live te confirme sur WhatsApp au {bk.phone}.</p></div>
      </div>
      <h3 className="mini">Ce que reçoit l’équipe Bovann au même moment</h3>
      <div className="notifs">
        <article className="mail">
          <header><span>De : reservations@ocdlive (maquette)</span><span>À : équipe Bovann</span></header>
          <h4>Nouvelle réservation · {bk.shop} · {dayLabel(bk.day)}</h4>
          <p><b>{bk.name}</b> fait du business en <b>{bk.business.toLowerCase()}</b> ({bk.shop}). Il ou elle a réservé le <b>{dayLabel(bk.day)} de {slotLabel(bk.slot)}</b>, {where}.</p>
          <ul><li>Forfait : {bk.pack.name} ({fmt(bk.pack.price)}){bk.pack.bovann ? ` · ${bk.pack.bovann} annonce(s) vidéo par Bovann` : ''}</li><li>Produits : {bk.products}</li><li>Contact : {bk.phone} · {bk.city}</li></ul>
        </article>
        <article className="wa">
          <span className="wa-h">WhatsApp · Équipe OCD Live</span>
          <p>🔔 {bk.name} ({bk.shop}) a réservé {dayLabel(bk.day)}, {slotLabel(bk.slot)} · {bk.mode === 'distance' ? `à distance (${bk.country}) : prévoir l’animatrice` : 'présentiel'} · {bk.pack.name}.</p>
        </article>
      </div>
      <div className="row"><button className="btn ghost" onClick={again}>Nouvelle réservation</button><button className="btn" onClick={toAdmin}>Voir l’espace équipe →</button></div>
    </div>
  );
}

/* ---------------- Espace équipe ---------------- */
function Admin({ bookings, seen }) {
  const [filter, setFilter] = useState('tous');
  const list = bookings.filter((x) => filter === 'tous' || x.mode === filter);
  const revenue = bookings.reduce((s, x) => s + x.pack.price, 0);
  const remote = bookings.filter((x) => x.mode === 'distance').length;
  const boosts = bookings.reduce((s, x) => s + (x.pack.bovann || 0), 0);
  return (
    <div className="wrap admin">
      <div className="sec-head"><h2>Espace équipe</h2><span className="pill">Données fictives</span></div>
      <div className="kpis">
        <div><b>{bookings.length}</b><span>Réservations décembre</span></div>
        <div><b>{fmt(revenue)}</b><span>Chiffre prévu</span></div>
        <div><b>{remote}</b><span>Lives à distance (animatrice)</span></div>
        <div><b>{boosts}</b><span>Annonces vidéo Bovann à faire</span></div>
      </div>
      <div className="admin-grid">
        <section className="feed">
          <h3>Notifications</h3>
          {bookings.slice(0, 6).map((x, i) => (
            <div key={x.ref} className={'notif' + (i < bookings.length - seen ? ' new' : '')}>
              <b>{x.name}</b> · {x.shop} a réservé {dayLabel(x.day)}, {slotLabel(x.slot)} · {x.mode === 'distance' ? `à distance (${x.country})` : 'présentiel'}
              <small>{x.at}</small>
            </div>
          ))}
        </section>
        <section className="table-wrap">
          <div className="filters">
            {[['tous', 'Tous'], ['presentiel', 'Présentiel'], ['distance', 'À distance']].map(([k, l]) => (
              <button key={k} className={filter === k ? 'on' : ''} onClick={() => setFilter(k)}>{l}</button>
            ))}
          </div>
          <div className="scroll-x">
            <table>
              <thead><tr><th>Réf.</th><th>Client</th><th>Activité</th><th>Date</th><th>Live</th><th>Forfait</th><th>Contact</th></tr></thead>
              <tbody>
                {list.map((x) => (
                  <tr key={x.ref}>
                    <td className="mono">{x.ref}</td>
                    <td><b>{x.name}</b><small>{x.shop}</small></td>
                    <td>{x.business}</td>
                    <td>{new Date(YEAR, MONTH, x.day).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' })}<small>{slotLabel(x.slot)}</small></td>
                    <td><span className={'tag ' + x.mode}>{x.mode === 'distance' ? x.country : 'Studio'}</span></td>
                    <td>{x.pack.name}<small>{fmt(x.pack.price)}</small></td>
                    <td className="mono">{x.phone}<small>{x.city}</small></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}

/* ---------------- Candidature animatrice ---------------- */
function JobModal({ close }) {
  const [sent, setSent] = useState(false);
  return (
    <div className="modal" role="dialog" aria-modal="true" aria-label="Postuler comme animatrice live" onClick={close}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <button className="x" onClick={close} aria-label="Fermer">×</button>
        {sent ? (
          <><h3>Candidature envoyée</h3><p>Merci ! L’équipe OCD Live te rappelle pour un essai au studio. (Maquette : rien n’a été envoyé.)</p><button className="btn" onClick={close}>Fermer</button></>
        ) : (
          <form onSubmit={(e) => { e.preventDefault(); setSent(true); }}>
            <h3>Animatrice live · Studio de Lomé</h3>
            <p className="sub">Temps plein. Tu accompagnes les commerçants qui font leur live à distance.</p>
            <Field label="Nom complet"><input id="j-name" required /></Field>
            <Field label="Numéro WhatsApp"><input id="j-phone" inputMode="tel" required /></Field>
            <Field label="Quartier à Lomé"><input id="j-area" /></Field>
            <Field label="Lien d’une courte vidéo où tu te présentes (facultatif)"><input id="j-video" placeholder="TikTok, Instagram…" /></Field>
            <button className="btn">Envoyer ma candidature</button>
          </form>
        )}
      </div>
    </div>
  );
}

export default function App() {
  const [view, setView] = useState('home');
  const [step, setStep] = useState(0);
  const [b, setB] = useState(EMPTY);
  const [bookings, setBookings] = useState(MOCK_BOOKINGS);
  const [seen, setSeen] = useState(MOCK_BOOKINGS.length - 2);
  const [last, setLast] = useState(null);
  const [job, setJob] = useState(false);

  const go = (v) => {
    if (v === 'booking') { setB(EMPTY); setStep(0); }
    if (v === 'admin') setTimeout(() => setSeen((s) => s), 0);
    setView(v); window.scrollTo({ top: 0 });
  };
  const start = (mode) => { setB({ ...EMPTY, mode }); setStep(mode ? 1 : 0); setView('booking'); window.scrollTo({ top: 0 }); };
  const confirm = () => {
    const ref = 'OCD-' + (1205 + bookings.length - MOCK_BOOKINGS.length);
    const pack = PACKAGES.find((p) => p.id === b.pack);
    const bk = { ref, ...b.info, mode: b.mode, day: b.day, slot: b.slot, pack, at: 'à l’instant',
      phone: b.info.phone, country: b.mode === 'distance' ? b.info.country : 'Togo' };
    setBookings([bk, ...bookings]); setLast(bk); setView('done'); window.scrollTo({ top: 0 });
  };
  const newCount = bookings.length - seen;

  return (
    <div className="app">
      <Header view={view === 'done' ? 'booking' : view} go={go} newCount={view === 'admin' ? 0 : newCount} />
      <main>
        {view === 'home' && <Home start={start} openJob={() => setJob(true)} />}
        {view === 'booking' && <Booking b={b} setB={setB} step={step} setStep={setStep} onConfirm={confirm} />}
        {view === 'done' && last && <Confirmed bk={last} again={() => go('booking')} toAdmin={() => { setView('admin'); window.scrollTo({ top: 0 }); }} />}
        {view === 'admin' && <AdminSeen bookings={bookings} seen={seen} markSeen={() => setSeen(bookings.length)} />}
      </main>
      <footer className="foot"><Logo /><span>Maquette de présentation · données et prix fictifs</span></footer>
      {job && <JobModal close={() => setJob(false)} />}
    </div>
  );
}

function AdminSeen({ bookings, seen, markSeen }) {
  React.useEffect(() => { const t = setTimeout(markSeen, 4000); return () => clearTimeout(t); }, []);
  return <Admin bookings={bookings} seen={seen} />;
}
