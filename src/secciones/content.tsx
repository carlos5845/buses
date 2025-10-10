import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import MapView from "./mapview";
export default function Content() {
  return (
    <section className="relative overflow-hidden max-w-7xl bg-[url('https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ1Qhf7CYO2IfuWMQ6N5J_PjDT4fi58tyKYig&s')] bg-cover border-white/10 rounded-3xl mt-8 mr-auto ml-auto w-full">
      {/* Overlay con gradientes */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(1000px_400px_at_20%_-10%,rgba(16,185,129,0.18),transparent),radial-gradient(700px_300px_at_90%_10%,rgba(59,130,246,0.12),transparent)] bg-gray-950/40 backdrop-blur-2xl"></div>

      {/* Contenedor */}

      <div className="grid grid-cols-4 grid-rows-5 gap-4 p-4 max-w-7xl mr-0 w-full">
        <div className="col-span-3 row-span-5  rounded-2xl">
          <MapView />
        </div>
        <div className="col-start-4">Buses disponibles</div>
        <div className="col-start-4 row-start-2">
          <Card>
            <CardHeader>
              <CardTitle>Bus Norte</CardTitle>
              <CardDescription>Car d Description</CardDescription>
              <CardAction>Card Action</CardAction>
            </CardHeader>
            <CardContent>
              <p>Card Content</p>
            </CardContent>
            <CardFooter>
              <p>Card Footer</p>
            </CardFooter>
          </Card>
        </div>
        <div className="col-start-4 row-start-3">
          <Card>
            <CardHeader>
              <CardTitle>Card Title</CardTitle>
              <CardDescription>Card Description</CardDescription>
              <CardAction>Card Action</CardAction>
            </CardHeader>
            <CardContent>
              <p>Card Content</p>
            </CardContent>
            <CardFooter>
              <p>Card Footer</p>
            </CardFooter>
          </Card>
        </div>
      </div>
    </section>
  );
}
