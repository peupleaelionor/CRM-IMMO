// ─── Types ───────────────────────────────────────────────────────────────────

export interface AutomationRule {
  id: string;
  name: string;
  trigger: 'contact_created' | 'property_added' | 'deal_won' | 'deal_lost' | 'lead_score_changed' | 'task_overdue';
  conditions: Record<string, unknown>;
  action: 'create_task' | 'find_matches' | 'send_notification' | 'update_status' | 'assign_label';
  enabled: boolean;
}

export interface AutomationContext {
  contactName?: string;
  propertyTitle?: string;
  dealTitle?: string;
  score?: number;
  taskTitle?: string;
}

// ─── Default Rules ───────────────────────────────────────────────────────────

export function getDefaultRules(): AutomationRule[] {
  return [
    {
      id: 'rule_1',
      name: 'Nouveau contact → Créer tâche de suivi',
      trigger: 'contact_created',
      conditions: {},
      action: 'create_task',
      enabled: true,
    },
    {
      id: 'rule_2',
      name: 'Bien ajouté → Trouver acheteurs correspondants',
      trigger: 'property_added',
      conditions: {},
      action: 'find_matches',
      enabled: true,
    },
    {
      id: 'rule_3',
      name: 'Deal gagné → Notifier l\'équipe',
      trigger: 'deal_won',
      conditions: {},
      action: 'send_notification',
      enabled: true,
    },
    {
      id: 'rule_4',
      name: 'Score lead > 80 → Marquer comme prioritaire',
      trigger: 'lead_score_changed',
      conditions: { minScore: 80 },
      action: 'update_status',
      enabled: true,
    },
    {
      id: 'rule_5',
      name: 'Deal perdu → Proposer relance',
      trigger: 'deal_lost',
      conditions: {},
      action: 'create_task',
      enabled: true,
    },
    {
      id: 'rule_6',
      name: 'Tâche en retard → Alerte',
      trigger: 'task_overdue',
      conditions: {},
      action: 'send_notification',
      enabled: true,
    },
  ];
}

// ─── Rule Execution ──────────────────────────────────────────────────────────

export function executeRule(rule: AutomationRule, context: AutomationContext): string {
  if (!rule.enabled) {
    return `Règle "${rule.name}" désactivée — aucune action effectuée.`;
  }

  switch (rule.trigger) {
    case 'contact_created':
      return `✅ Tâche de suivi créée pour le nouveau contact "${context.contactName ?? 'inconnu'}". Échéance : 48h.`;

    case 'property_added':
      return `🔍 Recherche de correspondances lancée pour le bien "${context.propertyTitle ?? 'inconnu'}". Les acheteurs compatibles seront notifiés.`;

    case 'deal_won':
      return `🎉 Notification envoyée à l'équipe : le deal "${context.dealTitle ?? 'inconnu'}" a été conclu avec succès !`;

    case 'deal_lost':
      return `📋 Tâche de relance créée suite à la perte du deal "${context.dealTitle ?? 'inconnu'}". Proposer des alternatives au client.`;

    case 'lead_score_changed': {
      const minScore = (rule.conditions.minScore as number) ?? 80;
      if (context.score !== undefined && context.score >= minScore) {
        return `🔥 Contact "${context.contactName ?? 'inconnu'}" marqué comme lead prioritaire (score : ${context.score}/100).`;
      }
      return `ℹ️ Score du contact "${context.contactName ?? 'inconnu'}" mis à jour (${context.score ?? 0}/100) — seuil non atteint.`;
    }

    case 'task_overdue':
      return `⚠️ Alerte : la tâche "${context.taskTitle ?? 'inconnu'}" est en retard. Une notification a été envoyée.`;

    default:
      return `Règle "${rule.name}" exécutée.`;
  }
}
