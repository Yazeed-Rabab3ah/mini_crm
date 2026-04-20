import  { Outlet } from "react-router-dom";
import Button from "./Button";

export default function AuthenticatedLayout() {
  return (
    <>
      <div className="flex flex-wrap items-center gap-4 border-b bg-[#F3F4FF] p-4">
        <Button
          data="home"
          navigateTo="/"
          className="rounded border border-[#0B1122] bg-[#0B1122] px-3 py-1.5 text-sm text-white hover:opacity-90"
        />
        <Button
          data="contacts"
          navigateTo="/contacts"
          className="ml-auto rounded border border-[#0B1122] bg-[#0B1122] px-3 py-1.5 text-sm text-white hover:opacity-90"
        />
      </div>
      <Outlet />
    </>
  );
}
