import React from 'react';

interface AsanLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  showSlogan?: boolean;
  className?: string;
  theme?: 'color' | 'white' | 'dark';
}

/**
 * 아산시 공식 심벌마크 (CI)
 * 
 * 상징 의미:
 * - 전통을 의미하는 녹색(#009640)과 첨단산업을 의미하는 청색(#005BAA)이 한 방향으로 나아가는 사람의 형상.
 * - 전통과 발전이 공존하는 아산시의 특성과 시민이 함께하는 미래 물결을 형상화.
 * - 슬로건: "다시 뛰는 아산, 더 행복한 시민"
 */
export const AsanLogo: React.FC<AsanLogoProps> = ({
  size = 'md',
  showText = true,
  showSlogan = false,
  className = '',
  theme = 'color',
}) => {
  const sizeMap = {
    sm: { icon: 'w-7 h-7', textTitle: 'text-base', textSub: 'text-[9px]' },
    md: { icon: 'w-10 h-10', textTitle: 'text-lg', textSub: 'text-[10px]' },
    lg: { icon: 'w-14 h-14', textTitle: 'text-2xl', textSub: 'text-xs' },
  };

  const isWhite = theme === 'white';

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* Official Asan CI Vector Symbol */}
      <div className={`relative shrink-0 ${sizeMap[size].icon} transition-transform hover:scale-105 duration-200`}>
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-xs"
        >
          <defs>
            {/* Asan Blue Gradient (첨단 산업 / 미래 발전) */}
            <linearGradient id="asanBlueGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0072CE" />
              <stop offset="100%" stopColor="#004B87" />
            </linearGradient>
            {/* Asan Green Gradient (전통 역사 / 청정 환경 / 온천) */}
            <linearGradient id="asanGreenGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00A859" />
              <stop offset="100%" stopColor="#007A3D" />
            </linearGradient>
            {/* Accent Highlight */}
            <linearGradient id="asanOrangeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FF8200" />
              <stop offset="100%" stopColor="#E05A00" />
            </linearGradient>
          </defs>

          {/* Background circle / crest container for authority */}
          <circle cx="50" cy="50" r="48" fill={isWhite ? 'rgba(255,255,255,0.1)' : '#F8FAFC'} stroke={isWhite ? 'rgba(255,255,255,0.3)' : '#E2E8F0'} strokeWidth="1.5" />

          {/* Forward-leaning Green Wave & Body (Left / Tradition & Nature) */}
          <path
            d="M 28 68 C 22 55, 26 38, 42 26 C 36 34, 38 46, 46 54 C 41 62, 33 66, 28 68 Z"
            fill={isWhite ? '#FFFFFF' : 'url(#asanGreenGrad)'}
          />
          {/* Head / Sun of the human figure */}
          <circle
            cx="48"
            cy="24"
            r="8"
            fill={isWhite ? '#FFFFFF' : 'url(#asanOrangeGrad)'}
          />

          {/* Forward-soaring Blue Wave (Right / Technology & Citizen Harmony) */}
          <path
            d="M 38 78 C 30 72, 36 60, 48 52 C 60 44, 76 34, 84 22 C 82 38, 68 54, 56 64 C 48 71, 42 76, 38 78 Z"
            fill={isWhite ? '#E0F2FE' : 'url(#asanBlueGrad)'}
          />

          {/* Connecting Flow / Dynamic Wave Base */}
          <path
            d="M 24 74 C 40 82, 62 80, 78 68 C 66 74, 48 74, 34 68 C 28 70, 24 73, 24 74 Z"
            fill={isWhite ? 'rgba(255,255,255,0.6)' : '#009640'}
            opacity="0.85"
          />
        </svg>
      </div>

      {/* Typography: Official Asan City Brand Font */}
      {showText && (
        <div className="flex flex-col leading-tight">
          <div className="flex items-baseline gap-1.5">
            <span
              className={`font-black tracking-tight ${sizeMap[size].textTitle} ${
                isWhite ? 'text-white' : 'text-slate-900'
              }`}
            >
              아산시
            </span>
            <span
              className={`font-bold tracking-wider ${sizeMap[size].textSub} ${
                isWhite ? 'text-blue-200' : 'text-[#005BAA]'
              }`}
            >
              ASAN CITY
            </span>
          </div>

          {showSlogan ? (
            <span className={`text-[10px] font-medium tracking-tight ${isWhite ? 'text-slate-200' : 'text-slate-500'}`}>
              다시 뛰는 아산, 더 행복한 시민
            </span>
          ) : (
            <span className={`text-[10px] font-semibold tracking-tight ${isWhite ? 'text-emerald-300' : 'text-emerald-700'}`}>
              스마트 민원행정 지원포털
            </span>
          )}
        </div>
      )}
    </div>
  );
};
