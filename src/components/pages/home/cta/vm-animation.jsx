'use client';
import { m } from 'framer-motion';
import { useEffect, useState } from 'react';
const SOURCE_CODE = [
  'kaam Salam() {',
  '  likh("Hello")',
  '}',
  'agar x > 10 {',
  '  likh("Big")',
  '} warna {',
  '  likh("Small")',
  '}',
  'fehrist[adad] nums = [1, 2, 3]',
  'har n mein nums {',
  '  likh(n)',
  '}',
];
const BYTECODE = [
  'LOAD_CONST 0 ("Hello")',
  'CALL_FUNCTION 1',
  'POP_TOP',
  'LOAD_NAME 0 (x)',
  'LOAD_CONST 1 (10)',
  'COMPARE_OP 4 (>)',
  'POP_JUMP_IF_FALSE 12',
  'LOAD_GLOBAL 1 (likh)',
  'LOAD_CONST 2 ("Big")',
  'CALL_FUNCTION 1',
  'RETURN_VALUE',
  'BUILD_LIST 3',
  'STORE_NAME 2 (nums)',
  'SETUP_LOOP 24',
  'LOAD_NAME 2 (nums)',
  'GET_ITER',
];
const VmAnimation = () => {
  const [sourceIndex, setSourceIndex] = useState(0);
  const [byteIndex, setByteIndex] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setSourceIndex((prev) => (prev + 1) % SOURCE_CODE.length);
      setByteIndex((prev) => (prev + 2) % BYTECODE.length);
    }, 1200);
    return () => clearInterval(interval);
  }, []);
  return (
    <div className="absolute inset-0 h-full w-full overflow-hidden bg-[#0A0A0B] font-mono opacity-40 select-none">
      <div className="absolute inset-0 z-10 bg-gradient-to-r from-[#E02424]/5 via-transparent to-[#E02424]/5" />
      <div className="absolute inset-0 z-10 bg-[radial-gradient(ellipse_at_center,transparent_0%,#0A0A0B_100%)]" />

      <div className="flex h-full w-full opacity-60">
        {/* Source Code Stream */}
        <div className="relative flex flex-1 flex-col items-end justify-center border-r border-gray-new-20/20 pr-16">
          <div className="absolute top-10 right-10 text-[10px] tracking-widest text-[#E02424] uppercase">
            1. Parser Stream
          </div>
          <div className="mask-image:linear-gradient(to_bottom,transparent,black_20%,black_80%,transparent) flex flex-col gap-4 whitespace-nowrap">
            {[...Array(7)].map((_, i) => {
              const idx = (sourceIndex + i) % SOURCE_CODE.length;
              const isCenter = i === 3;
              return (
                <m.div
                  key={`${idx}-${i}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: isCenter ? 1 : 0.3, x: 0, scale: isCenter ? 1.05 : 1 }}
                  transition={{ duration: 0.5 }}
                  className={`text-right ${isCenter ? 'font-bold text-white' : 'text-gray-new-40'}`}
                >
                  {SOURCE_CODE[idx]}
                </m.div>
              );
            })}
          </div>
        </div>
        {/* Translation Layer */}
        <div className="relative flex w-64 flex-col items-center justify-center border-r border-gray-new-20/20">
          <div className="absolute top-10 text-[10px] tracking-widest text-[#E02424] uppercase">
            2. Interpreter
          </div>
          <div className="relative flex h-full w-full items-center justify-center">
            {/* Connecting Lines */}
            <div className="absolute left-0 h-[1px] w-1/2 bg-gradient-to-r from-[#E02424]/40 to-transparent" />
            <div className="absolute right-0 h-[1px] w-1/2 bg-gradient-to-l from-[#E02424]/40 to-transparent" />

            {/* Compiler Node */}
            <m.div
              className="relative z-10 flex size-16 rotate-45 items-center justify-center border border-[#E02424]/40 bg-[#0A0A0B]"
              animate={{ rotate: [45, 135, 225, 315, 45] }}
              transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
            >
              <div className="size-8 border border-[#E02424] bg-[#E02424]/10" />
            </m.div>

            {/* Data Pulses */}
            <m.div
              className="absolute left-1/4 size-1.5 rounded-none bg-[#E02424]"
              animate={{ x: [0, 80], opacity: [1, 0] }}
              transition={{ duration: 1.2, repeat: Infinity }}
            />
            <m.div
              className="absolute right-1/4 size-1.5 rounded-none bg-white"
              animate={{ x: [0, 80], opacity: [1, 0] }}
              transition={{ duration: 1.2, repeat: Infinity, delay: 0.6 }}
            />
          </div>
        </div>
        {/* Bytecode Stream */}
        <div className="relative flex flex-1 flex-col items-start justify-center pl-16">
          <div className="absolute top-10 left-10 text-[10px] tracking-widest text-[#E02424] uppercase">
            3. VM Execution
          </div>
          <div className="mask-image:linear-gradient(to_bottom,transparent,black_20%,black_80%,transparent) flex flex-col gap-3 whitespace-nowrap">
            {[...Array(9)].map((_, i) => {
              const idx = (byteIndex + i) % BYTECODE.length;
              const isCenter = i === 4;
              return (
                <m.div
                  key={`${idx}-${i}-byte`}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: isCenter ? 1 : 0.2, x: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`flex gap-4 ${isCenter ? 'font-bold text-[#E02424]' : 'text-gray-new-50'}`}
                >
                  <span className="mt-1 text-xs opacity-50">
                    0x{(idx * 2).toString(16).padStart(4, '0')}
                  </span>
                  <span>{BYTECODE[idx]}</span>
                </m.div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
export default VmAnimation;
