// src/components/Hint.jsx
import Tippy from '@tippyjs/react';
import { HelpCircle } from 'lucide-react';

export default function HoverHint({ instruction }) {
  return (
    <div className="flex items-center space-x-2">
      <Tippy
  content={instruction}
  delay={[1000, 0]}
  placement="right"
  animation="fade"
  arrow={false}
  theme="translucent"               
  popperOptions={{
    modifiers: [
      {
        name: 'offset',
        options: { offset: [8, 10] }
      }
    ]
  }}
>
  <span className="block w-8 h-8 flex items-center justify-center cursor-help">
    <HelpCircle className="w-5 h-5 text-gray-500 opacity-25 pointer-events-none" />
  </span>
</Tippy>
    </div>
  );
}
