import { useState } from 'react';
import svgPaths from "../../imports/svg-gjkejt3b1w";
import Check from "../../imports/Check";

type Screen = 'network' | 'security' | 'tools' | 'settings';
type DNSProvider = 'cloudflare' | 'adguard' | 'google' | 'custom';

interface SecurityScreenProps {
  onNavigate: (screen: Screen) => void;
  openDNSDirectly?: boolean;
}

function ArrowLeft() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="arrow-left">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="arrow-left">
          <path d="M12 19L5 12M5 12L12 5M5 12H19" id="Vector" stroke="var(--stroke-0, #ADADAD)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
        </g>
      </svg>
    </div>
  );
}

function X() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="x">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="x">
          <path d="M18 6L6 18" id="Vector" stroke="var(--stroke-0, #ADADAD)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
          <path d="M6 6L18 18" id="Vector_2" stroke="var(--stroke-0, #ADADAD)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
        </g>
      </svg>
    </div>
  );
}

function Header({ onBack }: { onBack: () => void }) {
  return (
    <div className="content-stretch flex items-start justify-between relative shrink-0 w-full">
      <div onClick={onBack} className="box-border content-stretch flex flex-col gap-[6px] items-center p-[4px] relative shrink-0 cursor-pointer hover:opacity-70 transition-opacity">
        <ArrowLeft />
      </div>
      <div className="box-border content-stretch flex flex-col gap-[6px] items-center p-[4px] relative shrink-0 cursor-pointer hover:opacity-70 transition-opacity">
        <X />
      </div>
    </div>
  );
}



function DNSOption({ name, isActive, onClick }: { name: string; isActive?: boolean; onClick: () => void }) {
  return (
    <div onClick={onClick} className={`${isActive ? 'bg-[#fcfafa]' : 'bg-white'} relative rounded-[12px] shrink-0 w-full cursor-pointer hover:bg-[#f5f0f0] transition-colors`}>
      <div className="flex flex-col items-center size-full">
        <div className="box-border content-stretch flex items-center px-[16px] py-[12px] relative w-full gap-[4px]">
          <p className="basis-0 font-['Inter:Medium',_sans-serif] font-medium grow leading-[20px] min-h-px min-w-px not-italic relative shrink-0 text-[16px] text-neutral-950 text-nowrap">{name}</p>
          <div className="content-stretch flex flex-col gap-[6px] items-center justify-center relative shrink-0 w-[16px]">
            {isActive && <div className="size-[16px]"><Check /></div>}
          </div>
        </div>
      </div>
    </div>
  );
}

function DNSStatusCard({ onClick }: { onClick: () => void }) {
  return (
    <div onClick={onClick} className="bg-[#fcfafa] relative rounded-[12px] shrink-0 w-full cursor-pointer hover:bg-[#f5f0f0] transition-colors">
      <div className="flex flex-col items-center size-full">
        <div className="box-border content-stretch flex flex-col gap-[8px] items-center px-[16px] py-[12px] relative w-full">
          <div className="content-stretch flex gap-[4px] items-center relative shrink-0 w-full">
            <p className="basis-0 font-['Inter:Medium',_sans-serif] font-medium grow leading-[20px] min-h-px min-w-px not-italic relative shrink-0 text-[16px] text-neutral-950">Защита DNS</p>
            <div className="content-stretch flex flex-col gap-[6px] items-center justify-center relative shrink-0 w-[16px]">
              <div className="size-[16px]"><Check /></div>
            </div>
          </div>
          <div className="content-stretch flex gap-[10px] items-center justify-center relative shrink-0 w-full">
            <p className="basis-0 font-['Inter:Regular',_sans-serif] font-normal grow leading-[1.4] min-h-px min-w-px not-italic relative shrink-0 text-[#151313] text-[14px]">Блокировка нежелательного контента включена</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Content({ onOpenDNS }: { onOpenDNS: () => void }) {
  return (
    <div className="basis-0 content-stretch flex flex-col gap-[16px] grow items-start min-h-px min-w-px relative shrink-0 w-full">
      <div className="content-stretch flex flex-col gap-[12px] items-start relative shrink-0 w-full">
        <div className="content-stretch flex gap-[8px] items-center relative shrink-0 w-full">
          <p className="basis-0 font-['Inter:Semi_Bold',_sans-serif] font-semibold grow leading-[1.2] min-h-px min-w-px not-italic relative shrink-0 text-[24px] text-neutral-950">Безопасность</p>
        </div>
      </div>

      <DNSStatusCard onClick={onOpenDNS} />
    </div>
  );
}

function Waypoints({ isActive }: { isActive?: boolean }) {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="waypoints">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="waypoints">
          <path d={svgPaths.p25276b80} id="Vector" stroke={isActive ? "var(--stroke-0, #3CB57F)" : "var(--stroke-0, #ADADAD)"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
        </g>
      </svg>
    </div>
  );
}

function ShieldCheck() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="shield-check">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="shield-check">
          <path d={svgPaths.p31c87d00} id="Vector" stroke="var(--stroke-0, #3CB57F)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
        </g>
      </svg>
    </div>
  );
}

function Wrench({ isActive }: { isActive?: boolean }) {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="wrench">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="wrench">
          <path d={svgPaths.pdf34300} id="Vector" stroke={isActive ? "var(--stroke-0, #3CB57F)" : "var(--stroke-0, #ADADAD)"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
        </g>
      </svg>
    </div>
  );
}

function Settings({ isActive }: { isActive?: boolean }) {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="settings">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="settings">
          <g id="Vector"></g>
          <path d={svgPaths.p1a317300} id="Vector_2" stroke={isActive ? "var(--stroke-0, #3CB57F)" : "var(--stroke-0, #ADADAD)"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
          <path d={svgPaths.p3697eb00} id="Vector_3" stroke={isActive ? "var(--stroke-0, #3CB57F)" : "var(--stroke-0, #ADADAD)"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
        </g>
      </svg>
    </div>
  );
}

function Navigation({ onNavigate }: { onNavigate: (screen: Screen) => void }) {
  return (
    <div className="content-stretch flex items-start justify-between relative shrink-0 w-full">
      <div onClick={() => onNavigate('network')} className="box-border content-stretch flex flex-col gap-[6px] items-center p-[4px] relative shrink-0 cursor-pointer hover:opacity-70 transition-opacity">
        <Waypoints />
      </div>
      <div className="box-border content-stretch flex flex-col gap-[6px] items-center p-[4px] relative shrink-0">
        <ShieldCheck />
      </div>
      <div onClick={() => onNavigate('tools')} className="box-border content-stretch flex flex-col gap-[6px] items-center p-[4px] relative shrink-0 cursor-pointer hover:opacity-70 transition-opacity">
        <Wrench />
      </div>
      <div onClick={() => onNavigate('settings')} className="box-border content-stretch flex flex-col gap-[6px] items-center p-[4px] relative shrink-0 cursor-pointer hover:opacity-70 transition-opacity">
        <Settings />
      </div>
    </div>
  );
}

export default function SecurityScreen({ onNavigate, openDNSDirectly = false }: SecurityScreenProps) {
  const [showDNSProviders, setShowDNSProviders] = useState(openDNSDirectly);
  const [selectedProvider, setSelectedProvider] = useState<DNSProvider>('cloudflare');

  if (showDNSProviders) {
    return (
      <DNSProvidersScreen 
        onBack={() => setShowDNSProviders(false)} 
        onNavigate={onNavigate}
        selectedProvider={selectedProvider}
        onSelectProvider={(provider) => {
          setSelectedProvider(provider);
          setShowDNSProviders(false);
        }}
      />
    );
  }

  return (
    <div className="bg-white relative rounded-[12px] size-full">
      <div aria-hidden="true" className="absolute border border-neutral-200 border-solid inset-0 pointer-events-none rounded-[12px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1)]" />
      <div className="flex flex-col items-center size-full">
        <div className="box-border content-stretch flex flex-col gap-[16px] items-center p-[16px] relative size-full">
          <Header onBack={() => onNavigate('network')} />
          <Content onOpenDNS={() => setShowDNSProviders(true)} />
          <Navigation onNavigate={onNavigate} />
        </div>
      </div>
    </div>
  );
}

// DNS Providers Selection Screen
function DNSProvidersScreen({ 
  onBack, 
  onNavigate, 
  selectedProvider,
  onSelectProvider 
}: { 
  onBack: () => void; 
  onNavigate: (screen: Screen) => void;
  selectedProvider: DNSProvider;
  onSelectProvider: (provider: DNSProvider) => void;
}) {
  const [showProviderDetail, setShowProviderDetail] = useState<DNSProvider | null>(null);

  if (showProviderDetail) {
    return (
      <DNSProviderDetailScreen
        provider={showProviderDetail}
        onBack={() => setShowProviderDetail(null)}
        onNavigate={onNavigate}
        onSelect={(provider) => {
          onSelectProvider(provider);
        }}
      />
    );
  }

  return (
    <div className="bg-white relative rounded-[12px] size-full">
      <div aria-hidden="true" className="absolute border border-neutral-200 border-solid inset-0 pointer-events-none rounded-[12px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1)]" />
      <div className="flex flex-col items-center size-full">
        <div className="box-border content-stretch flex flex-col gap-[16px] items-center p-[16px] relative size-full">
          <Header onBack={onBack} />
          <div className="basis-0 content-stretch flex flex-col gap-[16px] grow items-start min-h-px min-w-px relative shrink-0 w-full">
            <div className="content-stretch flex flex-col gap-[12px] items-start relative shrink-0 w-full">
              <div className="content-stretch flex gap-[8px] items-center relative shrink-0 w-full">
                <p className="basis-0 font-['Inter:Semi_Bold',_sans-serif] font-semibold grow leading-[1.2] min-h-px min-w-px not-italic relative shrink-0 text-[24px] text-neutral-950">Защита DNS</p>
              </div>
              <div className="content-stretch flex gap-[8px] items-center relative shrink-0 w-full">
                <p className="basis-0 font-['Inter:Regular',_sans-serif] font-normal grow leading-[1.4] min-h-px min-w-px not-italic relative shrink-0 text-[#151313] text-[14px]">Выберите DNS-сервер для повышения безопасности и блокировки нежелательного контента</p>
              </div>
            </div>

            <div className="content-stretch flex flex-col gap-[8px] items-start relative shrink-0 w-full">
              <DNSOption name="Cloudflare" isActive={selectedProvider === 'cloudflare'} onClick={() => setShowProviderDetail('cloudflare')} />
              <DNSOption name="AdGuard" isActive={selectedProvider === 'adguard'} onClick={() => setShowProviderDetail('adguard')} />
              <DNSOption name="Google" isActive={selectedProvider === 'google'} onClick={() => setShowProviderDetail('google')} />
              <DNSOption name="Custom" isActive={selectedProvider === 'custom'} onClick={() => setShowProviderDetail('custom')} />
            </div>
          </div>
          <Navigation onNavigate={onNavigate} />
        </div>
      </div>
    </div>
  );
}

// DNS Provider Detail Screen (shows variants for selected provider)
function DNSProviderDetailScreen({
  provider,
  onBack,
  onNavigate,
  onSelect
}: {
  provider: DNSProvider;
  onBack: () => void;
  onNavigate: (screen: Screen) => void;
  onSelect: (provider: DNSProvider) => void;
}) {
  const providerNames: Record<DNSProvider, string> = {
    cloudflare: 'Cloudflare',
    adguard: 'AdGuard',
    google: 'Google',
    custom: 'Custom'
  };

  const providerVariants: Record<DNSProvider, Array<{ name: string; description: string }>> = {
    cloudflare: [
      { name: 'Стандартный', description: 'Быстрый и надёжный DNS' },
      { name: 'Блокировка вредоносных сайтов', description: 'Защита от фишинга и вредоносного ПО' },
      { name: 'Семейная защита', description: 'Блокировка контента для взрослых' }
    ],
    adguard: [
      { name: 'Стандартный', description: 'Блокировка рекламы' },
      { name: 'Семейная защита', description: 'Блокировка контента для взрослых' },
      { name: 'Без фильтрации', description: 'Только DNS без блокировок' }
    ],
    google: [
      { name: 'Стандартный', description: 'Публичный DNS от Google' }
    ],
    custom: [
      { name: 'Свой DNS-сервер', description: 'Введите адрес вручную' }
    ]
  };

  const [selectedVariant, setSelectedVariant] = useState(0);

  return (
    <div className="bg-white relative rounded-[12px] size-full">
      <div aria-hidden="true" className="absolute border border-neutral-200 border-solid inset-0 pointer-events-none rounded-[12px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1)]" />
      <div className="flex flex-col items-center size-full">
        <div className="box-border content-stretch flex flex-col gap-[16px] items-center p-[16px] relative size-full">
          <Header onBack={onBack} />
          <div className="basis-0 content-stretch flex flex-col gap-[16px] grow items-start min-h-px min-w-px relative shrink-0 w-full">
            <div className="content-stretch flex flex-col gap-[12px] items-start relative shrink-0 w-full">
              <div className="content-stretch flex gap-[8px] items-center relative shrink-0 w-full">
                <p className="basis-0 font-['Inter:Semi_Bold',_sans-serif] font-semibold grow leading-[1.2] min-h-px min-w-px not-italic relative shrink-0 text-[24px] text-neutral-950">{providerNames[provider]}</p>
              </div>
              <div className="content-stretch flex gap-[8px] items-center relative shrink-0 w-full">
                <p className="basis-0 font-['Inter:Regular',_sans-serif] font-normal grow leading-[1.4] min-h-px min-w-px not-italic relative shrink-0 text-[#151313] text-[14px]">Выберите вариант защиты</p>
              </div>
            </div>

            <div className="content-stretch flex flex-col gap-[8px] items-start relative shrink-0 w-full">
              {providerVariants[provider].map((variant, index) => (
                <div
                  key={index}
                  onClick={() => setSelectedVariant(index)}
                  className={`${selectedVariant === index ? 'bg-[#fcfafa]' : 'bg-white'} relative rounded-[12px] shrink-0 w-full cursor-pointer hover:bg-[#f5f0f0] transition-colors`}
                >
                  <div className="flex flex-col items-center size-full">
                    <div className="box-border content-stretch flex items-start px-[16px] py-[12px] relative w-full gap-[4px]">
                      <div className="basis-0 content-stretch flex flex-col gap-[4px] grow items-start min-h-px min-w-px relative shrink-0">
                        <p className="font-['Inter:Medium',_sans-serif] font-medium leading-[20px] not-italic text-[16px] text-neutral-950">{variant.name}</p>
                        <p className="font-['Inter:Regular',_sans-serif] font-normal leading-[1.4] not-italic text-[#151313] text-[14px]">{variant.description}</p>
                      </div>
                      <div className="content-stretch flex flex-col gap-[6px] items-center justify-center relative shrink-0 w-[16px] mt-[2px]">
                        {selectedVariant === index && <div className="size-[16px]"><Check /></div>}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div 
              onClick={() => onSelect(provider)}
              className="bg-[#3CB57F] relative rounded-[12px] shrink-0 w-full cursor-pointer hover:bg-[#35a070] transition-colors"
            >
              <div className="flex flex-col items-center size-full">
                <div className="box-border content-stretch flex items-center justify-center px-[16px] py-[12px] relative w-full">
                  <p className="font-['Inter:Medium',_sans-serif] font-medium leading-[20px] not-italic text-[16px] text-white">Применить</p>
                </div>
              </div>
            </div>
          </div>
          <Navigation onNavigate={onNavigate} />
        </div>
      </div>
    </div>
  );
}
