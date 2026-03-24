import Image from "next/image";

export default function Logo() {
  return (
    <Image
      src="/images/logo-placeholder.svg"
      alt="FlowTask Logo"
      width={250}
      height={100}
      loading="eager"
      style={{ objectFit: "contain" }}
    />
  );
}