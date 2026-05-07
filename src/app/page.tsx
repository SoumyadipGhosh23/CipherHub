import { CipherLab } from "@/components/cipher-lab/CipherLab";

export const metadata = {
  title: "CipherLab - Interactive Encryption Visualizer",
  description:
    "An interactive encryption and security visualization playground.",
};

export default function Home() {
  return (
    <main>
      <CipherLab />
    </main>
  );
}
