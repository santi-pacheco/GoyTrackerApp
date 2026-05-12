import { useEffect, useState } from 'react';
import { useAuth, signOut } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function Profile() {
  const { user } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [bodyweight, setBodyweight] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    void supabase
      .from('profiles')
      .select('display_name, bodyweight_kg')
      .eq('id', user.id)
      .single()
      .then(({ data }) => {
        if (data) {
          setDisplayName(data.display_name ?? '');
          setBodyweight(data.bodyweight_kg != null ? String(data.bodyweight_kg) : '');
        }
        setLoading(false);
      });
  }, [user]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setError(null);
    setMsg(null);
    setSaving(true);
    const { error } = await supabase
      .from('profiles')
      .update({
        display_name: displayName.trim() || null,
        bodyweight_kg: bodyweight === '' ? null : Number(bodyweight),
      })
      .eq('id', user.id);
    setSaving(false);
    if (error) {
      setError(error.message);
      return;
    }
    setMsg('Guardado.');
    setTimeout(() => setMsg(null), 2000);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Perfil</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm">
          <span className="text-muted-foreground">Email: </span>
          <span>{user?.email}</span>
        </div>

        {loading ? (
          <p className="text-sm text-muted-foreground">Cargando…</p>
        ) : (
          <form onSubmit={save} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="display-name">Nombre visible</Label>
              <Input
                id="display-name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Cómo te verán en el leaderboard"
                maxLength={40}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bw">Peso corporal (kg, opcional)</Label>
              <Input
                id="bw"
                type="number"
                inputMode="decimal"
                step="0.1"
                value={bodyweight}
                onChange={(e) => setBodyweight(e.target.value)}
                placeholder="ej. 78.5"
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            {msg && <p className="text-sm text-emerald-500">{msg}</p>}
            <Button type="submit" disabled={saving} className="w-full">
              {saving ? 'Guardando…' : 'Guardar'}
            </Button>
          </form>
        )}

        <Button variant="destructive" onClick={() => void signOut()} className="w-full">
          Cerrar sesión
        </Button>
      </CardContent>
    </Card>
  );
}
