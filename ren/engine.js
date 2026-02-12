/**
 * Regulatory Engagement Navigator (REN) Engine
 * "From Intelligence to Decision in 90 Seconds"
 * 
 * APAC FinStab+ Decision Layer
 */

const RENEngine = (function() {
  
  // ==========================================
  // MODULE 1: ENGAGEMENT TRIAGE ENGINE
  // ==========================================
  
  const triageMatrix = {
    // Event Type → Org Type → Decision
    'public_consultation': {
      'foundation': { decision: 'ENGAGE', reason: 'Public window open. Not responding = surrendering framing rights.' },
      'cex_licensed': { decision: 'ENGAGE', reason: 'Licensed entity expected to participate in regulatory process.' },
      'defi_unlicensed': { decision: 'MONITOR', reason: 'No direct obligation. Monitor for indirect impact.' },
      'investor': { decision: 'MONITOR', reason: 'Not a direct stakeholder. Track for due diligence.' }
    },
    'direct_inquiry': {
      'foundation': { decision: 'ENGAGE', reason: 'Direct inquiry requires careful, timely response.', caution: true },
      'cex_licensed': { decision: 'ENGAGE', reason: 'Mandatory response for licensed entities.', mandatory: true },
      'defi_unlicensed': { decision: 'ENGAGE', reason: 'Respond via proxy/legal counsel.', proxy: true },
      'investor': { decision: 'SILENT', reason: 'Redirect to legal counsel. No direct engagement.' }
    },
    'enforcement_competitor': {
      'foundation': { decision: 'SILENT', reason: 'No comment on enforcement actions against others.' },
      'cex_licensed': { decision: 'MONITOR', reason: 'Monitor for precedent implications.' },
      'defi_unlicensed': { decision: 'MONITOR', reason: 'Assess if enforcement rationale applies to you.' },
      'investor': { decision: 'ENGAGE', reason: 'Due diligence required. Reassess exposure.', internal: true }
    },
    'draft_leak': {
      'foundation': { decision: 'MONITOR', reason: 'Prepare response but wait for official release.' },
      'cex_licensed': { decision: 'MONITOR', reason: 'Prepare compliance assessment. Do not act on leaks.' },
      'defi_unlicensed': { decision: 'SILENT', reason: 'High risk. Wait for official publication.' },
      'investor': { decision: 'MONITOR', reason: 'Factor into risk models but verify before action.' }
    },
    'political_controversy': {
      'foundation': { decision: 'SILENT', reason: 'Political involvement destroys credible neutrality.' },
      'cex_licensed': { decision: 'SILENT', reason: 'Only engage if directly named. Via legal only.', unless_named: true },
      'defi_unlicensed': { decision: 'SILENT', reason: 'No upside. High downside.' },
      'investor': { decision: 'SILENT', reason: 'Political risk ≠ investment thesis.' }
    },
    'technical_misinformation': {
      'foundation': { decision: 'ENGAGE', reason: 'Correcting technical record is core mission.' },
      'cex_licensed': { decision: 'ENGAGE', reason: 'Engage via industry association channel.', via_association: true },
      'defi_unlicensed': { decision: 'ENGAGE', reason: 'Use public channels. Correct factual errors only.', public_only: true },
      'investor': { decision: 'SILENT', reason: 'Not your role to correct regulatory record.' }
    }
  };

  function runTriage(eventType, orgType, constraints) {
    const matrix = triageMatrix[eventType];
    if (!matrix) return { decision: 'MONITOR', reason: 'Unknown event type. Default to monitoring.', score: 0.5 };
    
    const result = matrix[orgType] || { decision: 'MONITOR', reason: 'Unknown organization type.', score: 0.5 };
    
    // Adjust for constraints
    let riskScore = result.decision === 'ENGAGE' ? 0.3 : (result.decision === 'MONITOR' ? 0.5 : 0.8);
    
    if (constraints.includes('under_investigation')) {
      riskScore = Math.min(riskScore + 0.4, 1.0);
      if (result.decision === 'ENGAGE') {
        return { 
          decision: 'SILENT', 
          reason: 'Under investigation. All engagement via legal counsel only.',
          riskScore,
          override: true
        };
      }
    }
    
    if (constraints.includes('credible_neutrality') && eventType === 'political_controversy') {
      riskScore = 1.0;
      return {
        decision: 'SILENT',
        reason: 'Credible neutrality mandate. Political engagement forbidden.',
        riskScore,
        override: true
      };
    }
    
    return { ...result, riskScore };
  }

  // ==========================================
  // MODULE 3: BOUNDARY COMPLIANCE ENGINE (BCE)
  // ==========================================
  
  function runBoundaryEngine(scenario) {
    const factors = {
      initiation: assessInitiation(scenario),
      falsifiability: assessFalsifiability(scenario),
      multiProtocol: assessMultiProtocol(scenario),
      regulatorNextAction: assessRegulatorAction(scenario),
      reproducibility: assessReproducibility(scenario)
    };
    
    const totalScore = Object.values(factors).reduce((sum, f) => sum + f.score, 0);
    
    let verdict, verdictClass;
    if (totalScore < 2.0) {
      verdict = 'DECLINE';
      verdictClass = 'danger';
    } else if (totalScore < 3.5) {
      verdict = 'PROCEED WITH CAUTION';
      verdictClass = 'warning';
    } else {
      verdict = 'SAFE TO RESPOND';
      verdictClass = 'success';
    }
    
    return {
      factors,
      totalScore,
      maxScore: 5.0,
      verdict,
      verdictClass,
      adjustments: generateAdjustments(factors, totalScore)
    };
  }
  
  function assessInitiation(scenario) {
    if (scenario.initiator === 'regulator') {
      return { score: 1.0, label: 'Regulator Initiated', detail: 'Regulator-initiated = bias toward engagement', signal: 'positive' };
    } else if (scenario.initiator === 'self') {
      return { score: 0.5, label: 'Self Initiated', detail: 'Self-initiated requires stronger public window justification', signal: 'neutral' };
    }
    return { score: 0.3, label: 'Third Party', detail: 'Third-party initiation = proceed carefully', signal: 'warning' };
  }
  
  function assessFalsifiability(scenario) {
    let score = 0.5;
    let details = [];
    
    if (scenario.includesCounterarguments) {
      score += 0.3;
      details.push('Includes counterarguments ✓');
    } else {
      details.push('Missing counterarguments ⚠');
    }
    
    if (scenario.citesVerifiableData) {
      score += 0.2;
      details.push('Cites verifiable data ✓');
    }
    
    if (scenario.onlyProArguments) {
      score = Math.max(score - 0.4, 0);
      details.push('Only pro-arguments detected 🚨');
    }
    
    return { 
      score: Math.min(score, 1.0), 
      label: 'Falsifiability', 
      detail: details.join('. '),
      signal: score > 0.7 ? 'positive' : (score > 0.4 ? 'neutral' : 'warning')
    };
  }
  
  function assessMultiProtocol(scenario) {
    if (scenario.protocolAgnostic) {
      return { score: 1.0, label: 'Multi-Protocol', detail: 'Document remains complete without protocol names', signal: 'positive' };
    } else if (scenario.protocolMentions === 'minimal') {
      return { score: 0.7, label: 'Minimal Protocol Reference', detail: 'Protocol mentioned but not central', signal: 'neutral' };
    }
    return { score: 0.3, label: 'Protocol Specific', detail: 'Heavy protocol-specific content. Consider abstracting.', signal: 'warning' };
  }
  
  function assessRegulatorAction(scenario) {
    if (scenario.expectedOutcome === 'understanding') {
      return { score: 1.0, label: 'Regulator Outcome', detail: 'Expected: Better technical understanding', signal: 'positive' };
    } else if (scenario.expectedOutcome === 'neutral_classification') {
      return { score: 0.8, label: 'Regulator Outcome', detail: 'Expected: Informed classification (any direction)', signal: 'positive' };
    } else if (scenario.expectedOutcome === 'favorable_classification') {
      return { score: 0.2, label: 'Regulator Outcome', detail: 'Expected: More favorable classification 🚨', signal: 'danger' };
    }
    return { score: 0.5, label: 'Regulator Outcome', detail: 'Outcome unclear', signal: 'neutral' };
  }
  
  function assessReproducibility(scenario) {
    if (scenario.couldIndustryProduce) {
      return { score: 1.0, label: 'Reproducibility', detail: 'Industry association could produce similar content. Your credibility adds value.', signal: 'positive' };
    } else if (scenario.requiresInsiderKnowledge) {
      return { score: 0.2, label: 'Reproducibility', detail: 'Requires protocol-insider knowledge. Should go through EPAA/industry body.', signal: 'danger' };
    }
    return { score: 0.6, label: 'Reproducibility', detail: 'Partially reproducible by others', signal: 'neutral' };
  }
  
  function generateAdjustments(factors, score) {
    const adjustments = [];
    
    if (factors.falsifiability.score < 0.5) {
      adjustments.push('Add counterarguments and risk disclosures');
    }
    if (factors.multiProtocol.score < 0.5) {
      adjustments.push('Abstract protocol-specific references');
    }
    if (factors.regulatorNextAction.score < 0.5) {
      adjustments.push('Reframe to focus on technical education, not outcome advocacy');
    }
    if (factors.reproducibility.score < 0.5) {
      adjustments.push('Consider routing through industry association');
    }
    
    return adjustments;
  }

  // ==========================================
  // MODULE 4: TIMING INTELLIGENCE
  // ==========================================
  
  const timingData = {
    'HK': {
      'stablecoin_licensing': { deadline: '2026-03-31', clr: 1.2, optimalWindow: '2026-03-01 to 2026-03-20' },
      'vasp_custody': { deadline: '2026-12-31', clr: 1.5, optimalWindow: '2026-09-01 to 2026-11-15' }
    },
    'JP': {
      'fia_migration': { deadline: '2026-06-30', clr: 1.8, optimalWindow: '2026-03-15 to 2026-05-31' },
      'staking_tax': { deadline: '2026-03-31', clr: 1.3, optimalWindow: '2026-02-15 to 2026-03-15' }
    },
    'SG': {
      'stablecoin_framework': { deadline: '2026-06-30', clr: 1.1, optimalWindow: '2026-04-01 to 2026-06-01' }
    },
    'AU': {
      'afsl_deadline': { deadline: '2026-06-30', clr: 1.4, optimalWindow: '2026-03-01 to 2026-05-15' }
    },
    'KR': {
      'vaupa_phase2': { deadline: '2026-09-01', clr: 1.2, optimalWindow: '2026-06-01 to 2026-08-01' }
    }
  };

  function runTimingAnalysis(region, topic) {
    const regionData = timingData[region];
    if (!regionData || !regionData[topic]) {
      return { 
        available: false, 
        message: 'Timing data not available for this region/topic combination.' 
      };
    }
    
    const data = regionData[topic];
    const deadline = new Date(data.deadline);
    const now = new Date();
    const daysRemaining = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));
    const effectiveDeadline = new Date(deadline.getTime() * data.clr);
    
    return {
      available: true,
      officialDeadline: data.deadline,
      clrFactor: data.clr,
      effectiveDeadline: effectiveDeadline.toISOString().split('T')[0],
      daysRemaining,
      optimalWindow: data.optimalWindow,
      recommendation: daysRemaining < 14 ? 'URGENT' : (daysRemaining < 45 ? 'PREPARE NOW' : 'MONITOR'),
      note: data.clr > 1.3 ? `Historical CLR ${data.clr}x suggests actual enforcement may be delayed, but prepare for official deadline.` : null
    };
  }

  // ==========================================
  // MODULE 5: RIPPLE MAPPING
  // ==========================================
  
  const rippleMatrix = {
    'JP': {
      'KR': { weight: 0.85, lag: '3-6 months', reason: 'Both "advanced APAC framework" peers. Direct policy reference.' },
      'HK': { weight: 0.60, lag: '6-12 months', reason: 'Reference point but constrained by Beijing corridor.' },
      'TW': { weight: 0.75, lag: '3-6 months', reason: 'Language/cultural proximity. Direct precedent adoption.' },
      'AU': { weight: 0.40, lag: '12-18 months', reason: 'Independent AFSL framework. Indirect influence.' },
      'ID': { weight: 0.25, lag: '12-24 months', reason: 'Indirect via FATF mutual evaluation.' }
    },
    'HK': {
      'SG': { weight: 0.50, lag: '6-12 months', reason: 'Competing hubs. Watch but independent paths.' },
      'JP': { weight: 0.45, lag: '6-12 months', reason: 'Mutual monitoring. HK follows JP more than reverse.' },
      'CN': { weight: 0.30, lag: 'Varies', reason: 'One-way influence from Beijing on certain topics.' }
    },
    'SG': {
      'HK': { weight: 0.40, lag: '6-12 months', reason: 'Competing frameworks. Differentiation strategy.' },
      'AU': { weight: 0.35, lag: '12 months', reason: 'Commonwealth ties but independent regulatory philosophy.' },
      'ID': { weight: 0.30, lag: '12-18 months', reason: 'ASEAN coordination on some topics.' }
    },
    'KR': {
      'JP': { weight: 0.55, lag: '6-12 months', reason: 'Mutual reference but Korea increasingly independent.' }
    }
  };
  
  const noRippleTo = {
    'SG': 'Independent framework. Does not cite other jurisdictions.',
    'CN': 'Completely independent regulatory system.',
    'IN': 'Politically independent decision-making.'
  };

  function runRippleMapping(sourceRegion, topic) {
    const ripples = rippleMatrix[sourceRegion];
    if (!ripples) {
      return { 
        available: false, 
        source: sourceRegion,
        message: 'No ripple data available for this source jurisdiction.' 
      };
    }
    
    const propagation = [];
    const blocked = [];
    
    Object.entries(ripples).forEach(([target, data]) => {
      propagation.push({
        target,
        ...data
      });
    });
    
    Object.entries(noRippleTo).forEach(([region, reason]) => {
      if (!ripples[region]) {
        blocked.push({ region, reason });
      }
    });
    
    // Sort by weight
    propagation.sort((a, b) => b.weight - a.weight);
    
    // Find leverage point
    const leveragePoint = propagation.length > 0 ? propagation[0] : null;
    
    return {
      available: true,
      source: sourceRegion,
      propagation,
      blocked,
      leveragePoint,
      recommendation: leveragePoint 
        ? `If influencing APAC-wide policy on ${topic}, intervene in ${sourceRegion} FIRST. ${sourceRegion} is the leverage point with ${(leveragePoint.weight * 100).toFixed(0)}% propagation weight to ${leveragePoint.target}.`
        : `${sourceRegion} has limited regional influence. Consider parallel engagement strategy.`
    };
  }

  // ==========================================
  // MAIN REN PROCESSOR
  // ==========================================
  
  function processQuery(input) {
    const startTime = Date.now();
    
    const results = {
      timestamp: new Date().toISOString(),
      input,
      modules: {}
    };
    
    // Module 1: Triage
    results.modules.triage = runTriage(
      input.eventType,
      input.orgType,
      input.constraints || []
    );
    
    // Module 3: Boundary Engine
    results.modules.boundary = runBoundaryEngine({
      initiator: input.initiator || 'regulator',
      includesCounterarguments: input.includesCounterarguments || false,
      citesVerifiableData: input.citesVerifiableData || false,
      onlyProArguments: input.onlyProArguments || false,
      protocolAgnostic: input.protocolAgnostic || false,
      protocolMentions: input.protocolMentions || 'heavy',
      expectedOutcome: input.expectedOutcome || 'understanding',
      couldIndustryProduce: input.couldIndustryProduce || true,
      requiresInsiderKnowledge: input.requiresInsiderKnowledge || false
    });
    
    // Module 4: Timing
    if (input.region && input.topic) {
      results.modules.timing = runTimingAnalysis(input.region, input.topic);
    }
    
    // Module 5: Ripple
    if (input.region) {
      results.modules.ripple = runRippleMapping(input.region, input.topic);
    }
    
    results.processingTimeMs = Date.now() - startTime;
    
    return results;
  }

  // Public API
  return {
    processQuery,
    runTriage,
    runBoundaryEngine,
    runTimingAnalysis,
    runRippleMapping,
    version: '2.0.0-phase2'
  };
  
})();

// Export for Node.js if available
if (typeof module !== 'undefined' && module.exports) {
  module.exports = RENEngine;
}
