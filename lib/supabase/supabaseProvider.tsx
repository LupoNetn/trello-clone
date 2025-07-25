'use client';
import { createContext, useState } from "react"
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { useSession } from "@clerk/nextjs";
import { useEffect,useContext} from "react";

type supabaseClient = {
    supabase: SupabaseClient | null;
    isLoaded: boolean,
}

const Context = createContext<supabaseClient>({
    supabase: null,
    isLoaded: false,
})

export default function SupabaseProvider({ children }: { children: React.ReactNode }) {
    const { session } = useSession();
    const [supabase, setSupabase] = useState<SupabaseClient | null>(null);
    const [isLoaded, setIsLoaded] = useState(false);

   useEffect(() => {
    if(!session) return;

     const Client = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL! || "",
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY! || "",
        {
           accessToken: async () => session?.getToken() ?? null,
        }
    )

    setSupabase(Client)
    setIsLoaded(true);

   },[session])

    return (
      <Context.Provider value={{supabase,isLoaded}}>
        {!isLoaded ? <div>Loading..</div> : children}
      </Context.Provider>
    )
}

export const useSupabase = () => {
    const context = useContext(Context);
    if (!context) {
        throw new Error("useSupabase must be used within a SupabaseProvider");
    }
    return context;
}