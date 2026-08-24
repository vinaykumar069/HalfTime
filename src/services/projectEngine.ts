import { 
  ProjectHealth, 
  ScopeCutItem, 
  HealthStatus, 
  TaskItem,
  MVPFeature,
  Project
} from '../types';

export interface HackathonConfig {
  eventName: string;
  teamName: string;
  hackathonStart: number;
  hackathonDeadline: number;
  totalDurationHours: number;
}

// Fixed baseline for Demo Project: 11h available vs 14h work
export const TIME_AVAILABLE_HOURS = 11.0;
export const TIME_AVAILABLE_MINUTES = 11 * 60; // 660 minutes
export const BASE_WORK_MINUTES = 14 * 60; // 840 minutes = 14.0 hours

/**
 * Format minutes into clean hours and minutes string (e.g. "10h 15m", "14h", "45m")
 */
export function formatMinutes(minutes: number): string {
  const isNegative = minutes < 0;
  const absMinutes = Math.abs(minutes);
  const h = Math.floor(absMinutes / 60);
  const m = absMinutes % 60;

  let result = '';
  if (h > 0 && m > 0) {
    result = `${h}h ${m}m`;
  } else if (h > 0) {
    result = `${h}h`;
  } else {
    result = `${m}m`;
  }

  return isNegative ? `-${result}` : result;
}

/**
 * Format seconds into the requested "31 : 42 : 17" or "HACKATHON ENDED" format
 */
export function formatCountdown(secondsLeft: number): {
  display: string;
  hours: string;
  minutes: string;
  seconds: string;
  totalSeconds: number;
  status: 'NORMAL' | 'AT RISK' | 'CRITICAL';
  isEnded: boolean;
} {
  const sLeft = Math.max(0, Math.floor(secondsLeft));
  
  if (sLeft <= 0) {
    return {
      display: 'HACKATHON ENDED',
      hours: '00',
      minutes: '00',
      seconds: '00',
      totalSeconds: 0,
      status: 'CRITICAL',
      isEnded: true,
    };
  }

  const h = Math.floor(sLeft / 3600);
  const m = Math.floor((sLeft % 3600) / 60);
  const s = sLeft % 60;

  const pad = (n: number) => n.toString().padStart(2, '0');
  const hours = pad(h);
  const minutes = pad(m);
  const seconds = pad(s);

  let status: 'NORMAL' | 'AT RISK' | 'CRITICAL' = 'NORMAL';
  if (h <= 4) {
    status = 'CRITICAL';
  } else if (h <= 12) {
    status = 'AT RISK';
  } else {
    status = 'NORMAL';
  }

  return {
    display: `${hours} : ${minutes} : ${seconds}`,
    hours,
    minutes,
    seconds,
    totalSeconds: sLeft,
    status,
    isEnded: false,
  };
}

/**
 * Deterministic Project Health & Capacity Calculator
 * Supports both golden demo mode and dynamic multi-user projects.
 */
export function calculateProjectMetrics(
  scopeItems: ScopeCutItem[],
  project?: Project,
  tasks?: TaskItem[],
  features?: MVPFeature[]
): {
  health: ProjectHealth;
  workRemainingMinutes: number;
  workRemainingFormatted: string;
  timeAvailableMinutes: number;
  timeAvailableFormatted: string;
  capacityGapMinutes: number;
  capacityGapFormatted: string;
  isOverCapacity: boolean;
  selectedRecoverableMinutes: number;
  selectedRecoverableFormatted: string;
  selectedCount: number;
  cutCount: number;
  cutTotalMinutes: number;
  cutTotalFormatted: string;
  status: HealthStatus;
  statusText: string;
  bufferFormatted: string;
} {
  const isDemo = !project || project.isDemo || project.id === 'demo-doom';

  // 1. Determine available runway
  let timeAvailableMinutes = TIME_AVAILABLE_MINUTES;
  if (!isDemo && project.deadline) {
    const msLeft = new Date(project.deadline).getTime() - Date.now();
    timeAvailableMinutes = Math.max(0, Math.floor(msLeft / (60 * 1000)));
  }

  // 2. Determine base work minutes
  let baseWorkMinutes = BASE_WORK_MINUTES;
  if (!isDemo) {
    if (tasks && tasks.length > 0) {
      baseWorkMinutes = tasks.reduce((sum, t) => {
        return sum + (t.status !== 'DONE' ? (t.estimatedMinutes || 60) : 0);
      }, 0);
    } else if (features && features.length > 0) {
      baseWorkMinutes = features.reduce((sum, f) => {
        return sum + (f.priority !== 'CUT' ? Math.round(f.estimatedHours * 60) : 0);
      }, 0);
    } else {
      // Clean starting baseline for new project without tasks yet
      baseWorkMinutes = 0;
    }
  }

  // Calculate cut minutes (already executed cuts)
  const cutItems = scopeItems.filter(item => item.isCut);
  const cutTotalMinutes = cutItems.reduce((acc, curr) => acc + curr.timeMinutes, 0);

  // Calculate selected recoverable minutes
  const selectedItems = scopeItems.filter(item => item.selectedForCut && !item.isCut);
  const selectedRecoverableMinutes = selectedItems.reduce((acc, curr) => acc + curr.timeMinutes, 0);

  const workRemainingMinutes = Math.max(0, baseWorkMinutes - (isDemo ? cutTotalMinutes : 0));
  const capacityGapMinutes = workRemainingMinutes - timeAvailableMinutes; // > 0 means over capacity, <= 0 means buffer!
  const isOverCapacity = capacityGapMinutes > 0;

  const status: HealthStatus = isOverCapacity ? 'at-risk' : 'on-track';
  const statusText = isOverCapacity ? 'AT RISK' : 'ON TRACK';

  let score: number;
  let scopePercent: number;
  let scopeStatus: string;

  if (isDemo) {
    if (isOverCapacity) {
      score = Math.max(50, Math.round(72 - (capacityGapMinutes - 180) * 0.05));
      scopePercent = 64;
      scopeStatus = 'TOO LARGE';
    } else {
      const buffer = Math.abs(capacityGapMinutes);
      score = Math.min(98, Math.round(88 + (buffer / 45) * 6));
      scopePercent = 96;
      scopeStatus = 'OPTIMAL';
    }
  } else {
    // Dynamic real project calculation
    if (workRemainingMinutes === 0 && timeAvailableMinutes > 0) {
      score = 100;
      scopePercent = 100;
      scopeStatus = 'READY TO PLAN';
    } else if (timeAvailableMinutes === 0) {
      score = 40;
      scopePercent = 50;
      scopeStatus = 'DEADLINE REACHED';
    } else if (isOverCapacity) {
      const overRatio = workRemainingMinutes / (timeAvailableMinutes || 1);
      score = Math.max(45, Math.round(75 - (overRatio - 1) * 20));
      scopePercent = Math.max(40, Math.round(70 / overRatio));
      scopeStatus = 'TOO LARGE';
    } else {
      const ratio = workRemainingMinutes / (timeAvailableMinutes || 1);
      score = Math.min(98, Math.round(90 + (1 - ratio) * 8));
      scopePercent = 95;
      scopeStatus = 'OPTIMAL';
    }
  }

  const timeAvailableHours = Number((timeAvailableMinutes / 60).toFixed(1));
  const workRemainingHours = Number((workRemainingMinutes / 60).toFixed(2));
  const capacityGapHours = Number((Math.abs(capacityGapMinutes) / 60).toFixed(2));

  const health: ProjectHealth = {
    score,
    status,
    timeAvailableHours,
    workRequiredHours: workRemainingHours,
    capacityGapHours: isOverCapacity ? capacityGapHours : 0,
    mvpPercent: isDemo ? 82 : (features && features.length > 0 ? Math.round((features.filter(f => f.priority === 'MUST_BUILD').length / features.length) * 100) : 100),
    mvpStatus: 'ON TRACK',
    scopePercent,
    scopeStatus,
    teamPercent: 91,
    teamStatus: 'ON TRACK',
    resourcesPercent: 48,
    resourcesStatus: 'LIMITED',
    testingPercent: isOverCapacity ? 31 : 85,
    testingStatus: isOverCapacity ? 'NEEDS ATTENTION' : 'VERIFIED',
  };

  const bufferFormatted = isOverCapacity
    ? `${formatMinutes(capacityGapMinutes)} OVER CAPACITY`
    : `${formatMinutes(Math.abs(capacityGapMinutes))} BUFFER`;

  return {
    health,
    workRemainingMinutes,
    workRemainingFormatted: formatMinutes(workRemainingMinutes),
    timeAvailableMinutes,
    timeAvailableFormatted: formatMinutes(timeAvailableMinutes),
    capacityGapMinutes,
    capacityGapFormatted: formatMinutes(capacityGapMinutes),
    isOverCapacity,
    selectedRecoverableMinutes,
    selectedRecoverableFormatted: formatMinutes(selectedRecoverableMinutes),
    selectedCount: selectedItems.length,
    cutCount: cutItems.length,
    cutTotalMinutes,
    cutTotalFormatted: formatMinutes(cutTotalMinutes),
    status,
    statusText,
    bufferFormatted,
  };
}
