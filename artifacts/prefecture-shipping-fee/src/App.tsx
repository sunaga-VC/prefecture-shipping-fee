import { type ReactNode, useMemo, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  ArrowDown,
  Check,
  ChevronDown,
  CircleHelp,
  ClipboardCheck,
  Eraser,
  MapPin,
  Search,
  ShieldCheck,
  X,
} from 'lucide-react';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import {
  calculateRoute,
  PREFECTURES,
  searchPrefectures,
  type Prefecture,
  type Region,
} from '@/data/prefecture-master';
import NotFound from '@/pages/not-found';
import { Route, Switch, useLocation, Router as WouterRouter } from 'wouter';

const queryClient = new QueryClient();

const REGION_COLORS: Record<Region, string> = {
  北海道: 'bg-sky-100 text-sky-800',
  本州: 'bg-amber-100 text-amber-900',
  九州: 'bg-emerald-100 text-emerald-800',
  沖縄: 'bg-rose-100 text-rose-800',
};

type LocationFieldProps = {
  label: string;
  eyebrow: string;
  value: string;
  selected: Prefecture | null;
  onChange: (value: string) => void;
  onSelect: (prefecture: Prefecture) => void;
};

function LocationField({
  label,
  eyebrow,
  value,
  selected,
  onChange,
  onSelect,
}: LocationFieldProps) {
  const [isOpen, setIsOpen] = useState(false);
  const candidates = useMemo(() => searchPrefectures(value).slice(0, 7), [value]);

  return (
    <div className="relative">
      <div className="mb-3 flex items-center justify-between">
        <label
          htmlFor={`prefecture-${eyebrow}`}
          className="text-sm font-extrabold tracking-tight text-[hsl(var(--foreground))]"
        >
          {label}
        </label>
        <span className="font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-[hsl(var(--muted-foreground))]">
          {eyebrow}
        </span>
      </div>
      <div
        className={`focus-ring flex items-center gap-3 rounded-[0.8rem] border bg-[hsl(var(--card))] px-4 py-3 transition-all ${
          isOpen
            ? 'border-[hsl(var(--accent))] shadow-[0_8px_24px_hsl(var(--accent)/.08)]'
            : 'border-[hsl(var(--input))]'
        }`}
      >
        <Search className="h-[18px] w-[18px] shrink-0 text-[hsl(var(--muted-foreground))]" />
        <input
          id={`prefecture-${eyebrow}`}
          data-testid={`input-${eyebrow}`}
          value={value}
          onChange={(event) => {
            onChange(event.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={(event) => {
            if (event.key === 'Escape') setIsOpen(false);
            if (event.key === 'Enter' && candidates[0]) {
              onSelect(candidates[0]);
              setIsOpen(false);
            }
          }}
          placeholder="都道府県名・読みで検索"
          autoComplete="off"
          className="min-w-0 flex-1 bg-transparent text-[15px] font-semibold text-[hsl(var(--foreground))] outline-none placeholder:font-medium placeholder:text-[hsl(var(--muted-foreground))]"
        />
        {value && (
          <button
            type="button"
            data-testid={`button-clear-${eyebrow}`}
            aria-label={`${label}をクリア`}
            onClick={() => {
              onChange('');
              setIsOpen(true);
            }}
            className="rounded-full p-1 text-[hsl(var(--muted-foreground))] transition-colors hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))]"
          >
            <X className="h-4 w-4" />
          </button>
        )}
        <ChevronDown
          className={`h-[17px] w-[17px] shrink-0 text-[hsl(var(--muted-foreground))] transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </div>
      {selected && !isOpen && (
        <div className="mt-2 flex items-center gap-2 text-xs font-semibold text-[hsl(var(--muted-foreground))]">
          <Check className="h-3.5 w-3.5 text-[hsl(var(--accent))]" />
          地点を確定しました
          <span className="text-[hsl(var(--border))]">/</span>
          <span
            data-testid={`text-region-${eyebrow}`}
            className={`rounded-full px-2 py-1 text-[10px] font-bold ${REGION_COLORS[selected.region]}`}
          >
            {selected.region}エリア
          </span>
        </div>
      )}
      {isOpen && (
        <div className="absolute z-20 mt-2 w-full overflow-hidden rounded-[0.8rem] border border-[hsl(var(--card-border))] bg-[hsl(var(--card))] p-1.5 shadow-[0_18px_42px_hsl(220_34%_17%/.16)]">
          <div className="flex items-center justify-between px-3 py-2">
            <span className="font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-[hsl(var(--muted-foreground))]">
              候補 {candidates.length}件
            </span>
            {value && (
              <span className="text-[11px] font-medium text-[hsl(var(--muted-foreground))]">
                Enterで先頭を確定
              </span>
            )}
          </div>
          {candidates.length > 0 ? (
            candidates.map((prefecture) => (
              <button
                key={prefecture.name}
                type="button"
                data-testid={`candidate-${eyebrow}-${prefecture.name}`}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => {
                  onSelect(prefecture);
                  setIsOpen(false);
                }}
                className="group flex w-full items-center gap-3 rounded-[0.55rem] px-3 py-2.5 text-left transition-colors hover:bg-[hsl(var(--secondary))]"
              >
                <MapPin className="h-4 w-4 text-[hsl(var(--accent))] transition-transform group-hover:-translate-y-0.5" />
                <span className="flex-1">
                  <span className="block text-sm font-bold text-[hsl(var(--foreground))]">
                    {prefecture.name}
                  </span>
                  <span className="block text-[11px] font-medium tracking-wide text-[hsl(var(--muted-foreground))]">
                    {prefecture.reading}
                  </span>
                </span>
                <span
                  className={`rounded-full px-2 py-1 text-[10px] font-bold ${REGION_COLORS[prefecture.region]}`}
                >
                  {prefecture.region}
                </span>
              </button>
            ))
          ) : (
            <div className="px-3 pb-3 pt-2 text-sm font-medium text-[hsl(var(--muted-foreground))]">
              一致する都道府県がありません
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ResultPanel({
  departure,
  arrival,
}: {
  departure: Prefecture | null;
  arrival: Prefecture | null;
}) {
  const result =
    departure && arrival ? calculateRoute(departure, arrival) : null;
  const isEmpty = !departure && !arrival;
  const isPartial = (departure && !arrival) || (!departure && arrival);

  return (
    <section className="relative min-h-[365px] overflow-hidden rounded-[1.15rem] bg-[hsl(var(--primary))] p-6 text-[hsl(var(--primary-foreground))] shadow-[0_16px_40px_hsl(220_34%_17%/.17)] sm:p-8">
      <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full border-[18px] border-[hsl(var(--accent)/.16)]" />
      <div className="absolute -bottom-24 -left-20 h-52 w-52 rounded-full border-[1px] border-[hsl(var(--primary-foreground)/.1)]" />
      <div className="relative flex h-full min-h-[317px] flex-col">
        <div className="flex items-start justify-between">
          <div>
            <span className="font-mono text-[10px] font-medium uppercase tracking-[0.2em] text-[hsl(var(--primary-foreground)/.62)]">
              Dispatch output / 01
            </span>
            <h2 className="mt-3 text-xl font-extrabold tracking-tight">確認結果</h2>
          </div>
          <div className="rounded-full border border-[hsl(var(--primary-foreground)/.18)] p-2.5">
            <ClipboardCheck className="h-5 w-5 text-[hsl(var(--accent))]" />
          </div>
        </div>

        {result ? (
          <div className="rise-in mt-auto">
            <div className="mb-5 flex items-center gap-2 text-xs font-semibold text-[hsl(var(--primary-foreground)/.68)]">
              <span>{result.departure.name}</span>
              <span className="route-line h-px w-8" />
              <span>{result.arrival.name}</span>
            </div>
            <div className="flex items-end justify-between gap-3">
              <div>
                {result.fee ? (
                  <>
                    <p className="font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-[hsl(var(--accent))]">
                      適用料金
                    </p>
                    <p
                      data-testid="text-route-fee"
                      className="mt-1 text-[clamp(2.7rem,6vw,4.6rem)] font-extrabold leading-none tracking-[-0.07em]"
                    >
                      ¥{result.fee.toLocaleString('ja-JP')}
                    </p>
                  </>
                ) : (
                  <>
                    <p className="font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-[hsl(var(--primary-foreground)/.62)]">
                      マスタ登録
                    </p>
                    <p
                      data-testid="status-no-fee"
                      className="mt-2 text-3xl font-extrabold leading-none tracking-[-0.04em] text-[hsl(var(--primary-foreground)/.82)]"
                    >
                      料金設定なし
                    </p>
                  </>
                )}
              </div>
              <span className="mb-1 rounded-full bg-[hsl(var(--primary-foreground)/.1)] px-3 py-1.5 text-[11px] font-bold">
                {result.category}
              </span>
            </div>
            <div className="mt-6 flex items-center gap-2 border-t border-[hsl(var(--primary-foreground)/.14)] pt-4 text-xs font-medium text-[hsl(var(--primary-foreground)/.62)]">
              <ShieldCheck className="h-4 w-4 text-[hsl(var(--accent))]" />
              最新の料金マスタを参照しています
            </div>
          </div>
        ) : (
          <div className="mt-auto">
            <div
              data-testid="status-route-progress"
              className="flex h-[150px] flex-col justify-end"
            >
              <p className="font-mono text-[11px] font-medium uppercase tracking-[0.17em] text-[hsl(var(--accent))]">
                {isPartial ? 'もう一地点' : 'Route ready'}
              </p>
              <p className="mt-3 max-w-[330px] text-2xl font-extrabold leading-[1.18] tracking-[-0.04em]">
                {isEmpty
                  ? '出発地と到着地を選択してください'
                  : '到着地を選ぶと料金を照合します'}
              </p>
              <p className="mt-3 text-sm font-medium leading-relaxed text-[hsl(var(--primary-foreground)/.62)]">
                {isEmpty
                  ? '確定した地点だけが結果に反映されます。'
                  : '候補から都道府県を確定してください。'}
              </p>
            </div>
            <div className="mt-6 flex items-center gap-2 border-t border-[hsl(var(--primary-foreground)/.14)] pt-4 text-xs font-medium text-[hsl(var(--primary-foreground)/.55)]">
              <CircleHelp className="h-4 w-4" />
              読み方でも検索できます
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function Home() {
  const [departure, setDeparture] = useState<Prefecture | null>(null);
  const [arrival, setArrival] = useState<Prefecture | null>(null);
  const [departureQuery, setDepartureQuery] = useState('');
  const [arrivalQuery, setArrivalQuery] = useState('');

  const clearRoute = () => {
    setDeparture(null);
    setArrival(null);
    setDepartureQuery('');
    setArrivalQuery('');
  };

  return (
    <main className="app-shell paper-grid min-h-[100dvh] overflow-hidden">
      <header className="border-b border-[hsl(var(--border)/.75)] bg-[hsl(var(--background)/.84)] backdrop-blur-md">
        <div className="mx-auto flex max-w-[1240px] items-center justify-between px-5 py-4 sm:px-8 lg:px-10">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-[0.65rem] bg-[hsl(var(--primary))] shadow-[3px_3px_0_hsl(var(--accent))]">
              <ArrowDown className="h-5 w-5 text-[hsl(var(--accent))]" />
            </div>
            <div>
              <p className="text-sm font-extrabold leading-tight tracking-tight">
                運賃確認デスク
              </p>
              <p className="font-mono text-[9px] font-medium uppercase tracking-[0.16em] text-[hsl(var(--muted-foreground))]">
                route desk / jp
              </p>
            </div>
          </div>
          <div className="hidden items-center gap-2.5 text-xs font-semibold text-[hsl(var(--muted-foreground))] sm:flex">
            <span className="h-2 w-2 rounded-full bg-[hsl(163_43%_38%)] soft-pulse" />
            料金マスタ稼働中
            <span className="ml-3 border-l border-[hsl(var(--border))] pl-4 font-mono text-[10px] tracking-wide">
              LOCAL MASTER · 47
            </span>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1240px] px-5 pb-12 pt-10 sm:px-8 sm:pt-14 lg:px-10 lg:pt-16">
        <section className="rise-in mb-10 max-w-3xl">
          <div className="mb-5 flex items-center gap-3">
            <span className="h-px w-8 bg-[hsl(var(--accent))]" />
            <span className="font-mono text-[10px] font-medium uppercase tracking-[0.22em] text-[hsl(var(--accent))]">
              instant route check
            </span>
          </div>
          <h1 className="max-w-[780px] text-[clamp(2.5rem,6vw,5.25rem)] font-extrabold leading-[.98] tracking-[-0.075em] text-[hsl(var(--primary))]">
            迷わず、<span className="text-[hsl(var(--accent))]">運賃</span>を。
          </h1>
          <p className="mt-5 max-w-[540px] text-[15px] font-medium leading-[1.85] text-[hsl(var(--muted-foreground))] sm:text-base">
            発送元と届け先を選ぶだけ。エリア区分と料金を、現場で確認しやすい形に整えました。
          </p>
        </section>

        <div className="grid items-stretch gap-5 lg:grid-cols-[1.08fr_.92fr] lg:gap-6">
          <section className="rise-in rise-in-delay-1 rounded-[1.15rem] border border-[hsl(var(--card-border))] bg-[hsl(var(--card)/.86)] p-5 shadow-[0_12px_30px_hsl(220_34%_17%/.05)] backdrop-blur-sm sm:p-8">
            <div className="mb-8 flex items-start justify-between gap-3">
              <div>
                <span className="font-mono text-[10px] font-medium uppercase tracking-[0.2em] text-[hsl(var(--muted-foreground))]">
                  Input route / 02
                </span>
                <h2 className="mt-2 text-xl font-extrabold tracking-tight">ルートを指定</h2>
              </div>
              {(departure || arrival) && (
                <button
                  type="button"
                  data-testid="button-reset-route"
                  onClick={clearRoute}
                  className="group flex items-center gap-1.5 rounded-full border border-[hsl(var(--border))] px-3 py-2 text-xs font-bold text-[hsl(var(--muted-foreground))] transition-all hover:border-[hsl(var(--accent))] hover:text-[hsl(var(--accent))]"
                >
                  <Eraser className="h-3.5 w-3.5 transition-transform group-hover:-rotate-12" />
                  クリア
                </button>
              )}
            </div>

            <div className="space-y-5">
              <LocationField
                label="出発地"
                eyebrow="departure"
                value={departureQuery}
                selected={departure}
                onChange={(value) => {
                  setDepartureQuery(value);
                  if (departure?.name !== value) setDeparture(null);
                }}
                onSelect={(prefecture) => {
                  setDeparture(prefecture);
                  setDepartureQuery(prefecture.name);
                }}
              />
              <div className="flex items-center gap-3 pl-1">
                <div className="flex h-7 w-7 items-center justify-center rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--secondary))]">
                  <ArrowDown className="h-3.5 w-3.5 text-[hsl(var(--accent))]" />
                </div>
                <span className="font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-[hsl(var(--muted-foreground))]">
                  destination
                </span>
                <div className="h-px flex-1 bg-[hsl(var(--border))]" />
              </div>
              <LocationField
                label="到着地"
                eyebrow="arrival"
                value={arrivalQuery}
                selected={arrival}
                onChange={(value) => {
                  setArrivalQuery(value);
                  if (arrival?.name !== value) setArrival(null);
                }}
                onSelect={(prefecture) => {
                  setArrival(prefecture);
                  setArrivalQuery(prefecture.name);
                }}
              />
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-x-3 gap-y-2 border-t border-[hsl(var(--border)/.8)] pt-5 text-xs font-medium text-[hsl(var(--muted-foreground))]">
              <span className="flex items-center gap-1.5">
                <Check className="h-3.5 w-3.5 text-[hsl(var(--accent))]" />
                候補をクリックして確定
              </span>
              <span className="hidden h-3 w-px bg-[hsl(var(--border))] sm:block" />
              <span>都道府県名・ひらがな対応</span>
            </div>
          </section>

          <div className="rise-in rise-in-delay-2">
            <ResultPanel departure={departure} arrival={arrival} />
          </div>
        </div>

        <section className="rise-in rise-in-delay-3 mt-7 grid gap-5 border-t border-[hsl(var(--border)/.8)] pt-6 sm:grid-cols-[1fr_auto] sm:items-end">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] font-medium uppercase tracking-[0.2em] text-[hsl(var(--muted-foreground))]">
                Master guide
              </span>
              <span className="h-1 w-1 rounded-full bg-[hsl(var(--accent))]" />
              <span className="text-xs font-semibold text-[hsl(var(--muted-foreground))]">
                エリア区分
              </span>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {(Object.keys(REGION_COLORS) as Region[]).map((region) => (
                <span
                  key={region}
                  data-testid={`legend-region-${region}`}
                  className={`rounded-full px-3 py-1.5 text-xs font-bold ${REGION_COLORS[region]}`}
                >
                  {region}
                </span>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-3 text-right">
            <div>
              <p className="text-xs font-bold text-[hsl(var(--foreground))]">
                国内47都道府県
              </p>
              <p className="mt-1 text-[11px] font-medium text-[hsl(var(--muted-foreground))]">
                料金設定なしの区間も表示
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--card)/.7)]">
              <MapPin className="h-4 w-4 text-[hsl(var(--accent))]" />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function Router() {
  return (
    <RoutedErrorBoundary>
      <Switch>
        <Route path="/" component={Home} />
        <Route component={NotFound} />
      </Switch>
    </RoutedErrorBoundary>
  );
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;