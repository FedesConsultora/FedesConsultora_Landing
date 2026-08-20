function getGaliciaProgressState_(leadId) {
  var lead=resolveGaliciaLead_(safeString_(leadId));
  if (!lead) return {found:false};
  var landing=getCampaignLandingForLead_(lead)||{};

  return {
    found:true,
    leadId:safeString_(lead.lead_id),
    landingKey:safeString_(lead.landing_key)||GALICIA_PRIMARY_LANDING_KEY,
    landingPath:normalizeCampaignLandingPath_(landing.path),
    status:safeString_(lead.status),
    stage:safeString_(lead.stage),
    currentStep:safeNumber_(lead.current_step,1),
    lastQuestionKey:safeString_(lead.last_question_key),
    website:safeString_(lead.website),
    answers:getLeadAnswersMap_(lead.lead_id),
    classification:safeString_(lead.classification),
    benefit:safeString_(lead.benefit),
    benefitLabel:safeString_(landing.benefit_label),
    benefitPercent:safeNumber_(landing.benefit_percent,0)
  };
}
