import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Exercises from './Exercises';
import Templates from './Templates';

export default function Library() {
  return (
    <Tabs defaultValue="exercises" className="space-y-4">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="exercises">Ejercicios</TabsTrigger>
        <TabsTrigger value="templates">Rutinas</TabsTrigger>
      </TabsList>
      <TabsContent value="exercises">
        <Exercises />
      </TabsContent>
      <TabsContent value="templates">
        <Templates />
      </TabsContent>
    </Tabs>
  );
}
