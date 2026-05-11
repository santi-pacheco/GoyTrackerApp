import { Plus, X } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SetRow } from './SetRow';
import { useSessionStore, type ActiveExercise } from '@/stores/sessionStore';

export function ExerciseCard({ exercise }: { exercise: ActiveExercise }) {
  const addSet = useSessionStore((s) => s.addSet);
  const removeExercise = useSessionStore((s) => s.removeExercise);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="font-semibold">{exercise.exercise_name}</div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => removeExercise(exercise.id)}
          className="text-muted-foreground"
          title="Quitar ejercicio"
        >
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-2 pb-4">
        <div className="grid grid-cols-[2rem_1fr_1fr_3.5rem_2.25rem_2.25rem] gap-2 px-1 text-xs uppercase tracking-wide text-muted-foreground">
          <div>#</div>
          <div className="text-center">kg</div>
          <div className="text-center">reps</div>
          <div className="text-center">RPE</div>
          <div />
          <div />
        </div>
        {exercise.sets.map((s, i) => (
          <SetRow
            key={s.id}
            exerciseId={exercise.id}
            exerciseName={exercise.exercise_name}
            restSeconds={exercise.rest_seconds}
            set={s}
            index={i}
          />
        ))}
        <Button variant="outline" size="sm" onClick={() => addSet(exercise.id)} className="w-full">
          <Plus className="mr-2 h-4 w-4" />
          Añadir serie
        </Button>
      </CardContent>
    </Card>
  );
}
