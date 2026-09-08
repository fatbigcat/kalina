'use client';

import { useState, type RefObject } from 'react';
import Paper from './Paper';
import { magnetTypes } from './Magnet';
import { defaultBoardPapers, paperSettingRanges, type BoardPaperSettings } from './boardPaperSettings';

const sliders = [
  ['width', 'Paper size', 'px'],
  ['fontSize', 'Text size', 'px'],
  ['paddingTop', 'Top padding', '%'], ['paddingRight', 'Right padding', '%'],
  ['paddingBottom', 'Bottom padding', '%'], ['paddingLeft', 'Left padding', '%'],
  ['magnetX', 'Magnet horizontal position', '%'], ['magnetY', 'Magnet vertical position', '%'],
  ['magnetSize', 'Magnet size / paper width', '%'],
] as const;

export default function BoardPapers({ boundsRef }: { boundsRef: RefObject<HTMLDivElement | null> }) {
  const [papers, setPapers] = useState(defaultBoardPapers);
  const [saved, setSaved] = useState(defaultBoardPapers);
  const [selected, setSelected] = useState(0);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState('');
  const paper = papers[selected];
  const dirty = JSON.stringify(papers) !== JSON.stringify(saved);
  const update = (patch: Partial<BoardPaperSettings>) => {
    setPapers(previous => previous.map((entry, i) => i === selected ? { ...entry, ...patch } : entry));
    setStatus('Unsaved preview');
  };
  const save = async () => {
    setSaving(true);
    setStatus('Saving…');
    try {
      const response = await fetch('/api/board-papers', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(papers),
      });
      if (!response.ok) throw new Error('Save failed. Your preview is still available; try again.');
      setSaved(papers);
      setStatus('Saved to project defaults.');
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Unable to save. Try again.');
    } finally {
      setSaving(false);
    }
  };

  return <>
    <div className="relative mx-6 flex flex-wrap items-start justify-center gap-5 md:gap-12">
      {papers.map((entry, index) => (
        <Paper key={entry.id} onBoard boundsRef={boundsRef} label={entry.label}
          type={entry.type} rotation={entry.rotation}
          // One responsive width drives Paper's shared transform, including its magnet.
          width={`clamp(${entry.width * 0.7}px, ${entry.width / 6}vw, ${entry.width}px)`}
          writingStyle={entry.writingStyle} magnet={entry.magnet === 'auto' ? undefined : entry.magnet}
          magnetProps={{ size: 240 * entry.magnetSize / 100 }}
          attachment={{ left: `${entry.magnetX}%`, top: `${entry.magnetY}%` }}
          className={`shrink-0 ${index ? 'mt-8' : ''}`}
          contentStyle={{
            fontSize: entry.fontSize,
            padding: `${entry.paddingTop}% ${entry.paddingRight}% ${entry.paddingBottom}% ${entry.paddingLeft}%`,
          }}>
          <p style={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>{entry.text}</p>
        </Paper>
      ))}
    </div>
    {process.env.NODE_ENV === 'development' && (
      <details className="paper-editor">
        <summary>Adjust papers{dirty ? ' · unsaved' : ''}</summary>
        <form onSubmit={event => { event.preventDefault(); void save(); }}>
          <fieldset disabled={saving}>
            <label>Paper
              <select value={selected} onChange={event => setSelected(Number(event.target.value))}>
                {papers.map((entry, index) => <option key={entry.id} value={index}>{entry.label}</option>)}
              </select>
            </label>
            {sliders.map(([key, label, unit]) => (
              <label key={key}>
                <span>{label} <output>{Number(paper[key].toFixed(1))}{unit}</output></span>
                <input type="range" min={paperSettingRanges[key][0]} max={paperSettingRanges[key][1]}
                  step={key === 'magnetSize' ? 0.1 : 1} value={paper[key]} onChange={event => update({ [key]: Number(event.target.value) })} />
              </label>
            ))}
            <label>Magnet
              <select value={paper.magnet} onChange={event => update({ magnet: event.target.value as BoardPaperSettings['magnet'] })}>
                <option value="auto">Automatic (stable)</option>
                {magnetTypes.map(type => <option key={type} value={type}>{type.replaceAll('-', ' ')}</option>)}
              </select>
            </label>
            <label>Writing style
              <select value={paper.writingStyle} onChange={event => update({ writingStyle: event.target.value as BoardPaperSettings['writingStyle'] })}>
                <option value="pencil">Pencil</option><option value="pen">Pen</option><option value="marker">Marker</option>
              </select>
            </label>
            <label>Written text
              <textarea rows={4} maxLength={1000} value={paper.text} onChange={event => update({ text: event.target.value })} />
            </label>
            <div className="flex gap-2">
              <button type="submit" disabled={!dirty}>Save defaults</button>
              <button type="button" disabled={!dirty} onClick={() => { setPapers(saved); setStatus('Changes cancelled.'); }}>Cancel changes</button>
            </div>
          </fieldset>
          <p role="status">{status || 'Preview changes here, then save to the project.'}</p>
        </form>
      </details>
    )}
  </>;
}
