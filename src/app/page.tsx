import { CipherHub } from "@/components/cipher-hub/CipherHub";

export const metadata = {
  title: "CipherHub - Interactive Encryption Visualizer",
  description:
    "An interactive encryption and security visualization playground.",
};

export default function Home() {
  return (
    <main>
      <CipherHub />
    </main>
  );
}
