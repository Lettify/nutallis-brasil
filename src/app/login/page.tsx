"use client";

import * as React from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);

  const handleLogin = async () => {
    setError(null);
    const supabase = createSupabaseBrowserClient();
    const { error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (loginError) {
      setError("Credenciais invalidas.");
      return;
    }
    window.location.href = "/admin";
  };

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center gap-6 px-6">
      <div className="rounded-3xl border border-forest/10 bg-white/90 p-8">
        <h1 className="display-font text-3xl text-forest">Acesso ERP</h1>
        <p className="text-sm text-foreground/60">
          Entre com seu usuario admin para acessar o painel.
        </p>
        <div className="mt-6 space-y-3">
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
          <Input
            type="password"
            placeholder="Senha"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
          {error && <div className="text-xs text-red-600">{error}</div>}
          <Button type="button" className="w-full" onClick={() => void handleLogin()}>
            Entrar
          </Button>
        </div>
      </div>
    </div>
  );
}
