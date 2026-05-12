import { Outlet } from "react-router-dom";
import { ListSidebar } from "../components/ListSidebar.jsx";

export function MainLayout() {
  return (
    <div className="flex flex-1 justify-center bg-ms-canvas">
      <div className="flex w-full max-w-6xl flex-1 border-x border-ms-border bg-ms-canvas shadow-sm">
        <ListSidebar />
        <section className="min-w-0 flex-1 overflow-y-auto bg-ms-canvas">
          <Outlet />
        </section>
      </div>
    </div>
  );
}
