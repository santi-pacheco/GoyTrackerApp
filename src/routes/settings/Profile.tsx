import { useAuth, signOut } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function Profile() {
  const { user } = useAuth();
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
        <Button variant="destructive" onClick={() => void signOut()}>
          Cerrar sesión
        </Button>
      </CardContent>
    </Card>
  );
}
