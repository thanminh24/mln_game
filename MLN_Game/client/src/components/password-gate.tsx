import { useState, type ReactNode } from "react";

const SESSION_KEY = "mln_auth";
const CORRECT_PASSWORD = "12345678";

interface Props {
  children: ReactNode;
}

export function PasswordGate({ children }: Props) {
  const [unlocked, setUnlocked] = useState(() => sessionStorage.getItem(SESSION_KEY) === "1");
  const [value, setValue] = useState("");
  const [error, setError] = useState(false);

  if (unlocked) return <>{children}</>;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (value === CORRECT_PASSWORD) {
      sessionStorage.setItem(SESSION_KEY, "1");
      setUnlocked(true);
    } else {
      setError(true);
      setValue("");
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col items-center gap-6 p-10 bg-gray-900 rounded-2xl shadow-2xl border border-gray-800 w-80"
      >
        <div className="flex flex-col items-center gap-2">
          <span className="text-4xl">🎮</span>
          <h1 className="text-white text-xl font-bold tracking-wide">MLN Game</h1>
          <p className="text-gray-400 text-sm text-center">Nhập mật khẩu để vào game</p>
        </div>

        <input
          type="password"
          value={value}
          onChange={(e) => { setValue(e.target.value); setError(false); }}
          placeholder="Mật khẩu"
          autoFocus
          className={`w-full px-4 py-3 rounded-lg bg-gray-800 text-white text-center tracking-widest text-lg outline-none border transition-colors ${
            error ? "border-red-500" : "border-gray-700 focus:border-blue-500"
          }`}
        />

        {error && (
          <p className="text-red-400 text-sm -mt-2">Mật khẩu không đúng. Thử lại!</p>
        )}

        <button
          type="submit"
          className="w-full py-3 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
        >
          Vào game
        </button>
      </form>
    </div>
  );
}
