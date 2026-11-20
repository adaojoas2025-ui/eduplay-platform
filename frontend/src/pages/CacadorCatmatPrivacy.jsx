import { Link } from 'react-router-dom';
import sections from './catmat-policy';
export default function CacadorCatmatPrivacy() {
  return <main className="min-h-screen bg-slate-50 px-5 py-10"><article className="mx-auto max-w-3xl rounded-2xl border bg-white p-7 text-slate-800 sm:p-10"><Link to="/cacador-catmat" className="text-sm text-emerald-800">← Caçador de CATMAT</Link><h1 className="mt-5 text-3xl font-bold">Política de privacidade</h1><p className="mt-2 text-slate-500">Caçador de CATMAT · 20/11/2026</p>{sections.map(([title, paragraphs], i) => <section key={title} className="mt-7"><h2 className="text-xl font-bold">{i + 1}. {title}</h2>{paragraphs.map(text => <p key={text} className="mt-3 text-sm leading-7">{text}</p>)}</section>)}</article></main>;
}
