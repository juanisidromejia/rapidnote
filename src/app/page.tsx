'use client';

import { useState, useEffect } from 'react';
import * as Tone from 'tone';

// Notas con posiciones específicas (espaciado vertical ajustado, última fila ~mitad pantalla)
const notePositions = [
  { note: 'F4', x: 0, y: 0 },      // Fa, esquina sup izq
  { note: 'A4', x: 304, y: 0 },    // La, esquina sup der
  { note: 'B4', x: 0, y: 120 },    // Si, lado izq, fila 2
  { note: 'C4', x: 152, y: 120 },  // Do, centrado entre Si y Re
  { note: 'D4', x: 304, y: 120 },  // Re, alineado vertical con La
  { note: 'G4', x: 0, y: 240 },    // Sol, lado izq, fila 3 ~mitad pantalla
  { note: 'E4', x: 304, y: 240 },  // Mi, alineado vertical con La
];

export default function Home() {
  const [selectedNotes, setSelectedNotes] = useState<string[]>([]);
  const [dimensions, setDimensions] = useState<{ width: number; height: number } | null>(null);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    const updateDimensions = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setDimensions({ width: window.innerWidth, height: window.innerHeight });
      }, 100);
    };
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', updateDimensions);
    };
  }, []);

  const handleNoteTouch = async (note: string) => {
    setSelectedNotes(prev => [...prev, note]);
    if (Tone.context.state !== 'running') {
      await Tone.start();
    }
    const synth = new Tone.Synth().toDestination();
    synth.triggerAttackRelease(note, '8n');
  };

  if (!dimensions) {
    return <div className="w-screen h-screen bg-[#dee2f0] border-4 border-black flex items-center justify-center text-black">Cargando...</div>;
  }

  // Escalar posiciones al viewport actual, con margen 10px
  const scaleX = (dimensions.width - 20) / 360; // 10px margen izq/der
  const scaleY = (dimensions.height / 2 - 20) / 320; // Zona superior, 10px margen

  return (
    <div className="relative w-screen h-screen bg-[#dee2f0] border-4 border-black overflow-hidden p-2.5">
      {notePositions.map(({ note, x, y }) => {
        const scaledX = x * scaleX + 10; // Offset margen
        const scaledY = y * scaleY + 10;
        return (
          <div
            key={note}
            className="absolute w-14 h-14 bg-[#133ebf] rounded-full cursor-pointer flex items-center justify-center text-white font-bold sm:w-12 sm:h-12 md:w-16 md:h-16"
            style={{ left: `${scaledX}px`, top: `${scaledY}px` }}
            onTouchStart={() => handleNoteTouch(note)}
            role="button"
            aria-label={`Nota ${note}`}
            tabIndex={0}
          >
            {note}
          </div>
        );
      })}
      <div className="absolute bottom-4 left-4 text-black">
        Notas seleccionadas: {selectedNotes.join(' ')}
      </div>
    </div>
  );
}
