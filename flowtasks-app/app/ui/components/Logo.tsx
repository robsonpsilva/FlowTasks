import Image from "next/image";

export default function Logo() {
  return (
    <Image
      src="/"
      alt="FlowTask Logo"
      width={250}
      height={100}
      style={{ objectFit: "contain" }}
    />
  );
}