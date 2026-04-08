import Image from "next/image";

export default function Logo() {
  return (
    <Image
      src="/images/icon.png"
      alt="FlowTask Logo"
      width={500}
      height={0}
      quality={100}
      priority
      className="h-auto w-[180px] md:w-[220px] object-contain" 
      style={{ width: 'auto', height: 'auto' }}
    />
  );
}