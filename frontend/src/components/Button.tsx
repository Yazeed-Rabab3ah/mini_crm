import { useNavigate } from "react-router-dom";
import { logout } from "../api/auth";

type Props = {
  className?: string;
  data?: string;
  navigateTo?: string;
};

export default function Button({ className, data, navigateTo }: Props) {
  const navigate = useNavigate();

  async function handleClick() {
    // Only treat the dedicated "Sign out" button as a logout action.
    if (data === "Sign out") {
      await logout();
      // Force a full refresh so auth-dependent pages re-evaluate correctly,
      // especially when already on the target route.
      const target = navigateTo ?? "/";
      window.location.replace(target);
      return;
    }

    if (navigateTo) {
      navigate(navigateTo, { replace: true });
      return;
    }

    // Fallback: keep prior behavior of navigating home.
    navigate("/", { replace: true });
  }

  return (
    <button type="button" onClick={handleClick} className={className}>
      {data}
    </button>
  );
}
