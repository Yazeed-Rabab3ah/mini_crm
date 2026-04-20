//import { getAccessToken, getRefreshToken } from "../api/auth";
//import Button from "../components/Button";

import { useRole } from '../contexts/RoleContext';

export default function HomePage() {
  //const authed = Boolean(getAccessToken() || getRefreshToken());
    const {isManager, isSupervisor, isEmployee} = useRole();
  
  return (

    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F3F4FF]">
      <h1 className="text-3xl font-bold mb-4">Welcome to our CRM system</h1>
      <p className="text-lg text-gray-700 mb-8">This is a simple homepage for testing purposes.</p>
      {isManager && <p className="text-green-500 mb-4">You are a Manager.</p>}
      {isSupervisor && <p className="text-blue-500 mb-4">You are a Supervisor.</p>}
      {isEmployee && <p className="text-purple-500 mb-4">You are an Employee.</p>}
    </div>

  );
}
