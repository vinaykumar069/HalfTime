import React, { useState } from 'react';
import { 
  Sparkles, 
  Clock, 
  Layers, 
  Users, 
  ArrowRight, 
  Play, 
  CheckCircle2, 
  AlertTriangle,
  Code,
  Flame,
  Check,
  Plus,
  Trash2
} from 'lucide-react';
import { BrandLogo } from '../BrandLogo';
import { UiverseGeminiButton } from '../common/UiverseGeminiButton';

interface OnboardingScreenProps {
  onCreateProject: (data: {
    name: string;
    hackathonName: string;
    deadline: string;
    description: string;
    teamName?: string;
    teamMembers?: string[];
    teamSkills?: string[];
  }) => Promise<void>;
  onSelectDemo: () => void;
  isLoading?: boolean;
}

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({
  onCreateProject,
  onSelectDemo,
  isLoading = false,
}) => {
  // 1. Project & Hackathon Prompt
  const [projectName, setProjectName] = useState('CampusShield');
  const [hackathonName, setHackathonName] = useState('DoraHacks 2.0');
  const [projectPrompt, setProjectPrompt] = useState(
    'An emergency response copilot that lets college students trigger verified dispatch alerts and auto-triages crowd safety reports.'
  );

  // 2. Tech Stack & Skills
  const commonTechOptions = ['React', 'TypeScript', 'Node.js', 'Gemini API', 'Supabase', 'Python', 'Tailwind CSS', 'FastAPI'];
  const [selectedTech, setSelectedTech] = useState<string[]>(['React', 'TypeScript', 'Gemini API', 'Supabase']);
  const [customSkillInput, setCustomSkillInput] = useState('');

  // 3. Remaining Runway Hours
  const [runwayHours, setRunwayHours] = useState<number>(12);

  // 4. Team Members & Count
  const [teamCount, setTeamCount] = useState<number>(3);
  const [teamName, setTeamName] = useState('Squad');
  const [memberNames, setMemberNames] = useState<string[]>([
    'Teammate 1',
    'Teammate 2',
    'Teammate 3',
  ]);

  const [formError, setFormError] = useState<string | null>(null);

  // Toggle quick tech tag
  const toggleTech = (tech: string) => {
    setSelectedTech(prev => 
      prev.includes(tech) ? prev.filter(t => t !== tech) : [...prev, tech]
    );
  };

  const handleAddCustomSkill = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && customSkillInput.trim()) {
      e.preventDefault();
      if (!selectedTech.includes(customSkillInput.trim())) {
        setSelectedTech(prev => [...prev, customSkillInput.trim()]);
      }
      setCustomSkillInput('');
    }
  };

  // Adjust team count and sync input rows
  const handleTeamCountChange = (count: number) => {
    setTeamCount(count);
    const updated = [...memberNames];
    if (count > updated.length) {
      for (let i = updated.length; i < count; i++) {
        updated.push(`Teammate ${i + 1}`);
      }
    } else if (count < updated.length) {
      updated.splice(count);
    }
    setMemberNames(updated);
  };

  const handleMemberNameChange = (index: number, name: string) => {
    const updated = [...memberNames];
    updated[index] = name;
    setMemberNames(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!projectName.trim()) {
      setFormError('Project name is required.');
      return;
    }
    if (!hackathonName.trim()) {
      setFormError('Hackathon name is required.');
      return;
    }
    if (!projectPrompt.trim()) {
      setFormError('Project prompt / description is required.');
      return;
    }

    const finalDeadlineIso = new Date(Date.now() + runwayHours * 3600 * 1000).toISOString();
    const finalMembers = memberNames.slice(0, teamCount).map((m, i) => m.trim() || `Teammate ${i + 1}`);

    await onCreateProject({
      name: projectName.trim(),
      hackathonName: hackathonName.trim(),
      description: projectPrompt.trim(),
      deadline: finalDeadlineIso,
      teamName: teamName.trim() || 'Squad',
      teamMembers: finalMembers.length > 0 ? finalMembers : ['Teammate 1'],
      teamSkills: selectedTech,
    });
  };

  return (
    <div className="min-h-screen bg-[#07090E] text-[#F1F5F9] flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 relative selection:bg-[#00FF88] selection:text-[#07090E]">
      {/* Ambient background glow */}
      <div className="fixed top-[-100px] right-[-100px] w-[500px] h-[500px] bg-[#00F0FF] opacity-[0.04] blur-[150px] rounded-full pointer-events-none" />
      <div className="fixed bottom-[-100px] left-[-100px] w-[500px] h-[500px] bg-[#00FF88] opacity-[0.04] blur-[150px] rounded-full pointer-events-none" />

      <div className="w-full max-w-2xl rounded-[36px] bg-[#0A0E18] border border-white/10 p-6 sm:p-10 shadow-2xl relative z-10 space-y-8">
        {/* Header Branding */}
        <div className="flex flex-col items-center text-center">
          <div className="mb-3">
            <BrandLogo size="lg" showLabel={false} animated={true} />
          </div>
          <span className="text-[11px] font-mono font-bold tracking-widest text-[#00F0FF] uppercase mb-1">
            HACKATHON COPILOT
          </span>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white font-display">
            IDEA &amp; STACK SETUP
          </h1>
          <p className="text-xs sm:text-sm text-[#94A3B8] mt-1 max-w-md">
            Input your project prompt, team skills, and remaining hours to initialize your autonomous War Room.
          </p>
        </div>

        {formError && (
          <div className="p-4 rounded-2xl bg-[#FF4D4D]/10 border border-[#FF4D4D]/30 flex items-center gap-3 text-xs text-[#FF4D4D]">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1: Project Prompt */}
          <div className="space-y-4 p-5 rounded-2xl bg-white/[0.02] border border-white/5">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-white uppercase">
              <span className="w-2 h-2 rounded-full bg-[#00FF88]" />
              <span>1. Project &amp; Hackathon Concept</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-mono text-[#94A3B8] uppercase mb-1 font-bold">
                  Project Name *
                </label>
                <input
                  type="text"
                  required
                  value={projectName}
                  onChange={e => setProjectName(e.target.value)}
                  placeholder="e.g. CampusShield"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/10 text-xs text-white placeholder-[#64748B] focus:outline-none focus:border-[#00FF88]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-[#94A3B8] uppercase mb-1 font-bold">
                  Hackathon Name *
                </label>
                <input
                  type="text"
                  required
                  value={hackathonName}
                  onChange={e => setHackathonName(e.target.value)}
                  placeholder="e.g. DoraHacks 2.0"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/10 text-xs text-white placeholder-[#64748B] focus:outline-none focus:border-[#00FF88]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-mono text-[#94A3B8] uppercase mb-1 font-bold flex items-center justify-between">
                <span>Project Prompt (Problem &amp; Solution) *</span>
                <span className="text-[10px] text-[#00FF88] lowercase">what you are building</span>
              </label>
              <textarea
                required
                rows={3}
                value={projectPrompt}
                onChange={e => setProjectPrompt(e.target.value)}
                placeholder="What core problem are you solving? What is your solution and secret sauce?"
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/10 text-xs text-white placeholder-[#64748B] focus:outline-none focus:border-[#00FF88] resize-none leading-relaxed"
              />
            </div>
          </div>

          {/* Section 2: Tech Stack & Skills */}
          <div className="space-y-3 p-5 rounded-2xl bg-white/[0.02] border border-white/5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-white uppercase">
                <Code className="w-3.5 h-3.5 text-[#00F0FF]" />
                <span>2. Tech Stack &amp; Team Skills</span>
              </div>
              <span className="text-[10px] font-mono text-[#00F0FF]">{selectedTech.length} SELECTED</span>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {commonTechOptions.map((tech) => {
                const isSelected = selectedTech.includes(tech);
                return (
                  <button
                    key={tech}
                    type="button"
                    onClick={() => toggleTech(tech)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all cursor-pointer flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-[#00FF88]/15 text-[#00FF88] border border-[#00FF88]/40 shadow-sm'
                        : 'bg-white/[0.03] text-[#94A3B8] border border-white/10 hover:text-white'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                    <span>{tech}</span>
                  </button>
                );
              })}
            </div>

            <div>
              <input
                type="text"
                value={customSkillInput}
                onChange={e => setCustomSkillInput(e.target.value)}
                onKeyDown={handleAddCustomSkill}
                placeholder="Type additional skill & press Enter (e.g. Next.js, Web3, Docker)..."
                className="w-full px-3.5 py-2 rounded-xl bg-black/60 border border-white/10 text-xs text-white placeholder-[#64748B] focus:outline-none focus:border-[#00FF88]"
              />
            </div>
          </div>

          {/* Section 3: Remaining Runway Hours */}
          <div className="space-y-3 p-5 rounded-2xl bg-white/[0.02] border border-white/5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-white uppercase">
                <Clock className="w-3.5 h-3.5 text-[#FFB800]" />
                <span>3. Remaining Hackathon Runway</span>
              </div>
              <span className="text-xs font-mono font-black text-[#00FF88]">{runwayHours} HOURS LEFT</span>
            </div>

            <div className="grid grid-cols-5 gap-2">
              {[6, 12, 18, 24, 36].map((hrs) => (
                <button
                  key={hrs}
                  type="button"
                  onClick={() => setRunwayHours(hrs)}
                  className={`py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                    runwayHours === hrs
                      ? 'bg-[#00FF88] text-[#07090E] shadow-md glow-emerald'
                      : 'bg-white/[0.03] text-[#94A3B8] border border-white/10 hover:text-white'
                  }`}
                >
                  {hrs}h
                </button>
              ))}
            </div>
          </div>

          {/* Section 4: Team Count & Names */}
          <div className="space-y-4 p-5 rounded-2xl bg-white/[0.02] border border-white/5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-white uppercase">
                <Users className="w-3.5 h-3.5 text-[#00FF88]" />
                <span>4. Team Members &amp; Roles</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-[11px] font-mono text-[#94A3B8] mr-1">Size:</span>
                {[1, 2, 3, 4, 5].map((cnt) => (
                  <button
                    key={cnt}
                    type="button"
                    onClick={() => handleTeamCountChange(cnt)}
                    className={`w-7 h-7 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                      teamCount === cnt
                        ? 'bg-[#00FF88] text-[#07090E]'
                        : 'bg-white/[0.04] text-[#94A3B8] hover:text-white'
                    }`}
                  >
                    {cnt}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-mono text-[#94A3B8] uppercase mb-1 font-bold">
                Team Name
              </label>
              <input
                type="text"
                value={teamName}
                onChange={e => setTeamName(e.target.value)}
                placeholder="e.g. Team DOOM"
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/10 text-xs text-white placeholder-[#64748B] focus:outline-none focus:border-[#00FF88]"
              />
            </div>

            {/* Member Name Input Rows */}
            <div className="space-y-2 pt-1">
              <label className="block text-[10px] font-mono text-[#64748B] uppercase font-bold">
                Enter Team Member Names ({teamCount} hacker{teamCount > 1 ? 's' : ''}):
              </label>
              {memberNames.slice(0, teamCount).map((name, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="w-6 text-[11px] font-mono text-[#94A3B8] text-right font-bold">#{idx + 1}</span>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={e => handleMemberNameChange(idx, e.target.value)}
                    placeholder={`e.g. ${idx === 0 ? 'Alex (Fullstack)' : idx === 1 ? 'Elena (Designer)' : 'Marcus (Pitch)'}`}
                    className="flex-1 px-3 py-2 rounded-xl bg-black/60 border border-white/10 text-xs text-white placeholder-[#64748B] focus:outline-none focus:border-[#00FF88]"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Submit Action */}
          <div className="pt-2 flex justify-center">
            <UiverseGeminiButton
              type="submit"
              disabled={isLoading}
              loading={isLoading}
              loadingText="INITIALIZING WAR ROOM..."
              icon={<Sparkles className="w-4 h-4 text-[#00FF88]" />}
              className="w-full"
            >
              LAUNCH WAR ROOM &amp; INGEST STACK →
            </UiverseGeminiButton>
          </div>

          {/* Quick Demo Sandbox link */}
          <div className="text-center pt-1">
            <button
              type="button"
              onClick={onSelectDemo}
              className="text-xs font-mono text-[#94A3B8] hover:text-white underline cursor-pointer"
            >
              Or explore interactive Demo Sandbox (Team DOOM) →
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
