import React from 'react';
import { AsanLogo } from './AsanLogo';
import { Phone, MapPin, Printer, Shield, ExternalLink, HelpCircle, Building2, CheckCircle2 } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 text-xs border-t border-slate-800 mt-auto">
      {/* Policy and Quick Navigation Bar */}
      <div className="border-b border-slate-800/80 bg-slate-950/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex flex-wrap items-center justify-between gap-3 text-[11px]">
          <div className="flex flex-wrap items-center gap-4 text-slate-300">
            <a
              href="https://www.asan.go.kr/main/cms/?no=62"
              target="_blank"
              rel="noreferrer"
              className="font-bold text-amber-400 hover:underline flex items-center gap-1"
            >
              <span>개인정보처리방침</span>
            </a>
            <span className="text-slate-700">|</span>
            <a
              href="https://www.asan.go.kr/main/cms/?no=63"
              target="_blank"
              rel="noreferrer"
              className="hover:text-white transition-colors"
            >
              저작권보호정책
            </a>
            <span className="text-slate-700">|</span>
            <a
              href="https://www.asan.go.kr/main/cms/?no=66"
              target="_blank"
              rel="noreferrer"
              className="hover:text-white transition-colors"
            >
              행정서비스헌장
            </a>
            <span className="text-slate-700">|</span>
            <a
              href="https://www.asan.go.kr/main/cms/?no=57"
              target="_blank"
              rel="noreferrer"
              className="hover:text-white transition-colors"
            >
              청사안내도
            </a>
            <span className="text-slate-700">|</span>
            <span className="text-emerald-400 font-semibold flex items-center gap-1">
              <Shield className="w-3 h-3" />
              <span>행정망 보안인증 준수</span>
            </span>
          </div>

          <div className="flex items-center gap-3 text-slate-400">
            <span className="text-[11px] text-slate-500">아산시 패밀리 사이트 바로가기:</span>
            <div className="flex items-center gap-2">
              {[
                { name: '아산시 대표포털', url: 'https://www.asan.go.kr/main/' },
                { name: '아산문화관광', url: 'https://www.asan.go.kr/tour/' },
                { name: '아산시의회', url: 'https://asansicouncil.go.kr/' },
                { name: '아산시보건소', url: 'https://www.asan.go.kr/health/' },
              ].map((site) => (
                <a
                  key={site.name}
                  href={site.url}
                  target="_blank"
                  rel="noreferrer"
                  className="px-2 py-0.5 rounded bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-all text-[10px] flex items-center gap-0.5 border border-slate-700/60"
                >
                  <span>{site.name}</span>
                  <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Information Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          {/* Logo & Slogan Column */}
          <div className="md:col-span-4 space-y-3">
            <AsanLogo size="md" showText={true} showSlogan={true} theme="white" />
            <div className="text-[11px] text-slate-400 leading-relaxed pl-1">
              <p className="font-semibold text-slate-300">
                아산시 반복·다양 민원 AI 답변 초안 지원시스템 (아산 민원도우미)
              </p>
              <p className="text-slate-500 text-[10px] mt-0.5">
                AI는 지원 도구이며, 최종 답변 결정과 발송 책임은 담당 공무원에게 있습니다.
              </p>
            </div>
          </div>

          {/* Contact and Address Column */}
          <div className="md:col-span-5 space-y-1.5 text-[11px] text-slate-300 border-l border-slate-800 md:pl-6">
            <div className="flex items-center gap-1.5 text-slate-200">
              <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>[31512] 충청남도 아산시 시민로 456 (온천동, 아산시청)</span>
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-slate-400">
              <span className="flex items-center gap-1">
                <Phone className="w-3 h-3 text-blue-400" />
                <span>대표전화: <strong>1422-42</strong>, 041-540-2114</span>
              </span>
              <span className="flex items-center gap-1">
                <Printer className="w-3 h-3 text-slate-500" />
                <span>팩스: 041-540-2009</span>
              </span>
            </div>
            <div className="text-slate-400 text-[10px]">
              <span>종합민원실 아산시 콜센터: <strong>1422-42</strong> (평일 08:30 ~ 18:30)</span>
              <span className="mx-2 text-slate-700">|</span>
              <span>야간·휴일 당직실: 041-540-2222</span>
            </div>
            <p className="text-[10px] text-slate-500 pt-1">
              Copyright © <strong>ASAN CITY</strong>. All Rights Reserved.
            </p>
          </div>

          {/* Official Government Mark Badges */}
          <div className="md:col-span-3 flex md:justify-end items-center gap-2.5">
            {/* WA Quality Mark */}
            <div className="px-2.5 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700 text-center flex flex-col items-center">
              <div className="text-[10px] font-black text-blue-400 tracking-tight">웹접근성(WA)</div>
              <div className="text-[8px] text-slate-400">품질인증 준수</div>
            </div>

            {/* KOGL Open Government License */}
            <div className="px-2.5 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700 text-center flex flex-col items-center">
              <div className="text-[10px] font-bold text-emerald-400 tracking-tight">공공누리 제1유형</div>
              <div className="text-[8px] text-slate-400">출처표시·자유이용</div>
            </div>

            {/* Digital Platform Government */}
            <div className="px-2.5 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700 text-center flex flex-col items-center">
              <div className="text-[10px] font-bold text-amber-400 tracking-tight">DPG 표준</div>
              <div className="text-[8px] text-slate-400">디지털플랫폼정부</div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
