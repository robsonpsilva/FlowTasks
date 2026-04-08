import Image from "next/image";

export default function Logo() {
  return (
    <Image
      src="/images/Logo1.png"
      alt="FlowTask Logo"
      width={250}
      height={250}
      quality={100}
      priority
      className="block w-[180px] md:w-[220px] object-contain"
    />
  );
}