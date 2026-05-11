import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import type { MuscleGroup } from '@/types/database';

const EQUIPMENT = ['barbell', 'dumbbell', 'machine', 'cable', 'bodyweight', 'other'] as const;

export function NewExerciseDialog({
  open,
  onOpenChange,
  muscleGroups,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  muscleGroups: MuscleGroup[];
  onCreated: () => void;
}) {
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [muscleId, setMuscleId] = useState<string>('');
  const [equipment, setEquipment] = useState<string>('barbell');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setError(null);
    setSaving(true);
    const { error } = await supabase.from('exercises').insert({
      name: name.trim(),
      primary_muscle_id: muscleId ? Number(muscleId) : null,
      equipment,
      owner_id: user.id,
    });
    setSaving(false);
    if (error) {
      setError(error.message);
      return;
    }
    setName('');
    setMuscleId('');
    setEquipment('barbell');
    onCreated();
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nuevo ejercicio</DialogTitle>
          <DialogDescription>Solo será visible en tu cuenta.</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="ex-name">Nombre</Label>
            <Input
              id="ex-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              minLength={2}
              placeholder="ej. Cable Crossover"
            />
          </div>
          <div className="space-y-2">
            <Label>Grupo muscular</Label>
            <Select value={muscleId} onValueChange={setMuscleId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona…" />
              </SelectTrigger>
              <SelectContent>
                {muscleGroups.map((g) => (
                  <SelectItem key={g.id} value={String(g.id)} className="capitalize">
                    {g.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Equipo</Label>
            <Select value={equipment} onValueChange={setEquipment}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {EQUIPMENT.map((e) => (
                  <SelectItem key={e} value={e} className="capitalize">
                    {e}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Guardando…' : 'Crear'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
