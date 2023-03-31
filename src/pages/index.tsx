import Head from "next/head";
import { useClientOnly } from "@/hooks/use-client-only";
import { HomeClient } from "@/client-pages";

export default function Home() {
  const isClient = useClientOnly();
  return (
    <>
      <Head>
        <title>Offline First React App</title>
        <meta
          name="description"
          content="Using NextJS only for its API functionality"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      {isClient ? <HomeClient /> : null}
    </>
  );
}
