import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'

/**
 * Client-side PDF Service for generating official A4 legal petitions & demand notices.
 * 
 * @param {string} templateId - Template ID ('fraud_complaint', 'legal_notice', 'rti_application', 'employment_grievance', 'consumer_complaint')
 * @param {object} formData - Form values filled by user
 * @returns {Promise<Blob>} - Valid PDF Blob ready for iframe preview or downloading as .pdf
 */
export async function createClientLegalPDF(templateId, formData = {}) {
  const pdfDoc = await PDFDocument.create()
  const page = pdfDoc.addPage([595.28, 841.89]) // A4 Dimensions
  const { width, height } = page.getSize()

  const fontNorm = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
  const fontOblique = await pdfDoc.embedFont(StandardFonts.HelveticaOblique)

  // Color Palette
  const navyColor = rgb(0.08, 0.18, 0.36)      // #142e5c
  const darkSlate = rgb(0.12, 0.16, 0.22)      // #1e293b
  const goldColor = rgb(0.85, 0.55, 0.05)      // #d98c0d
  const lightBg = rgb(0.96, 0.97, 0.99)        // #f5f7fa
  const borderGrey = rgb(0.8, 0.83, 0.88)      // #ccd4e0
  const alertRed = rgb(0.8, 0.12, 0.12)        // #cc1f1f

  let y = height - 40

  // 1. Top Header Banner
  page.drawRectangle({
    x: 35,
    y: y - 45,
    width: width - 70,
    height: 50,
    color: navyColor,
  })

  page.drawText('NYAYAMITRA LEGAL AID PORTAL', {
    x: 50,
    y: y - 22,
    size: 14,
    font: fontBold,
    color: rgb(1, 1, 1)
  })

  page.drawText('NATIONAL AI CITIZEN PROTECTION & PETITION SYSTEM', {
    x: 50,
    y: y - 36,
    size: 8,
    font: fontBold,
    color: goldColor
  })

  const dateStr = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' })
  page.drawText(`DATE: ${dateStr}`, {
    x: width - 140,
    y: y - 25,
    size: 9,
    font: fontBold,
    color: rgb(1, 1, 1)
  })

  y -= 65

  // Helper for section headers
  const drawSectionHeader = (title, color = navyColor) => {
    page.drawRectangle({
      x: 35,
      y: y - 18,
      width: width - 70,
      height: 22,
      color: lightBg,
      borderColor: borderGrey,
      borderWidth: 1
    })
    page.drawText(title.toUpperCase(), {
      x: 45,
      y: y - 13,
      size: 10,
      font: fontBold,
      color: color
    })
    y -= 28
  }

  // Helper for key-value rows
  const drawRow = (label, value) => {
    if (y < 70) return
    const valText = String(value || 'N/A')
    page.drawText(`${label}:`, { x: 45, y, size: 9, font: fontBold, color: darkSlate })
    
    const maxLen = 65
    if (valText.length > maxLen) {
      page.drawText(valText.substring(0, maxLen), { x: 180, y, size: 9, font: fontNorm, color: darkSlate })
      y -= 12
      page.drawText(valText.substring(maxLen, maxLen * 2), { x: 180, y, size: 9, font: fontNorm, color: darkSlate })
    } else {
      page.drawText(valText, { x: 180, y, size: 9, font: fontNorm, color: darkSlate })
    }
    y -= 15
  }

  // Helper for text block
  const drawTextBlock = (label, text) => {
    drawSectionHeader(label)
    const content = String(text || 'No detailed statement provided.')
    const words = content.split(' ')
    let line = ''
    const marginX = 45
    const maxW = width - 90

    for (let word of words) {
      const testLine = line ? `${line} ${word}` : word
      const testW = fontNorm.widthOfTextAtSize(testLine, 9)
      if (testW > maxW) {
        if (y < 60) break
        page.drawText(line, { x: marginX, y, size: 9, font: fontNorm, color: darkSlate })
        y -= 13
        line = word
      } else {
        line = testLine
      }
    }
    if (line && y >= 60) {
      page.drawText(line, { x: marginX, y, size: 9, font: fontNorm, color: darkSlate })
      y -= 18
    }
  }

  // -------------------------------------------------------------
  // TEMPLATE 1: FRAUD COMPLAINT (CYBER & FINANCIAL)
  // -------------------------------------------------------------
  if (templateId === 'fraud_complaint') {
    page.drawText('BEFORE THE OFFICER-IN-CHARGE, CYBER CRIME CELL / POLICE STATION', {
      x: 35,
      y,
      size: 11,
      font: fontBold,
      color: alertRed
    })
    y -= 22

    page.drawText('SUBJECT: OFFICIAL PETITION FOR FINANCIAL FRAUD UNDER SEC 43A IT ACT 2000 & SEC 318 BNS 2023', {
      x: 35,
      y,
      size: 8.5,
      font: fontBold,
      color: navyColor
    })
    y -= 25

    drawSectionHeader('1. COMPLAINANT IDENTIFICATION & PARTICULARS')
    drawRow('Complainant Name', formData.fullName)
    drawRow('Contact Phone', formData.contactPhone)
    drawRow('Bank / Platform', formData.bankName)
    drawRow('Incident Date', formData.transactionDate)
    drawRow('Monetary Loss (INR)', `INR ${formData.amountLost || '0'}`)
    drawRow('UTR / Ref Number', formData.utrReference || 'Pending Verification')

    y -= 10
    drawTextBlock('2. DETAILED STATEMENT OF FRAUD INCIDENT & FACTS', formData.incidentDescription)

    drawSectionHeader('3. STATUTORY DEMAND & PRAYER FOR RELIEF', alertRed)
    const prayerLines = [
      '1. Immediately freeze and hold disputed funds under Section 43A of Information Technology Act 2000.',
      '2. Register an official First Information Report (FIR) under Section 318 of Bharatiya Nyaya Sanhita (BNS).',
      '3. Initiate cyber tracing of suspect IP / bank node and assist complainant in financial recovery.'
    ]
    for (let pLine of prayerLines) {
      page.drawText(pLine, { x: 45, y, size: 8.5, font: fontNorm, color: darkSlate })
      y -= 14
    }
  }

  // -------------------------------------------------------------
  // TEMPLATE 2: FORMAL LEGAL NOTICE
  // -------------------------------------------------------------
  else if (templateId === 'legal_notice') {
    page.drawText('FORMAL LEGAL DEMAND NOTICE', {
      x: 35,
      y,
      size: 13,
      font: fontBold,
      color: navyColor
    })
    page.drawText('(SERVED VIA REGISTERED POST WITH ACKNOWLEDGEMENT DUE)', {
      x: 35,
      y: y - 14,
      size: 8,
      font: fontOblique,
      color: darkSlate
    })
    y -= 32

    drawSectionHeader('SENDER & RECIPIENT PARTICULARS')
    drawRow('From (Sender)', formData.senderName)
    drawRow('Sender Address', formData.senderAddress)
    drawRow('To (Recipient)', formData.recipientName)
    drawRow('Recipient Address', formData.recipientAddress)
    drawRow('Notice Subject', formData.noticeSubject)
    drawRow('Cure Deadline', formData.deadlineDays || '15 Days')

    y -= 10
    drawTextBlock('STATEMENT OF FACTS & CONTRACTUAL DEFAULT', formData.disputeDetails)

    drawSectionHeader('STATUTORY DEMAND & LEGAL CONSEQUENCES', alertRed)
    const noticeDemandLines = [
      `1. You are hereby called upon to satisfy the above grievance within ${formData.deadlineDays || '15 Days'} of receipt of this notice.`,
      '2. Take notice that failure to comply will compel my client to file a Civil Recovery Suit under Order 37 CPC.',
      '3. You shall also be liable for all litigation costs, damages, and statutory interest accruing thereon.'
    ]
    for (let nLine of noticeDemandLines) {
      page.drawText(nLine, { x: 45, y, size: 8.5, font: fontNorm, color: darkSlate })
      y -= 14
    }
  }

  // -------------------------------------------------------------
  // TEMPLATE 3: RTI APPLICATION (RIGHT TO INFORMATION)
  // -------------------------------------------------------------
  else if (templateId === 'rti_application') {
    page.drawText('APPLICATION FOR OBTAINING INFORMATION UNDER SECTION 6(1) OF RTI ACT, 2005', {
      x: 35,
      y,
      size: 10.5,
      font: fontBold,
      color: navyColor
    })
    y -= 25

    drawSectionHeader('1. APPLICANT & PUBLIC AUTHORITY PARTICULARS')
    drawRow('Applicant Name', formData.applicantName)
    drawRow('Public Authority', formData.publicAuthority)
    drawRow('Department Address', formData.departmentAddress)
    drawRow('Period of Info', formData.timePeriod)
    drawRow('Application Fee', `INR 10/- via ${formData.feeMode || 'Postal Order'}`)

    y -= 10
    drawTextBlock('2. SPECIFIC INFORMATION & RECORDS SOUGHT', formData.informationSought)

    drawSectionHeader('3. STATUTORY DECLARATION UNDER RTI ACT 2005')
    const rtiLines = [
      '1. I state that I am a citizen of India and entitled to seek information under Section 6(1) of RTI Act 2005.',
      '2. The information requested does not fall under any exemption specified in Section 8 or 9 of the Act.',
      '3. Please furnish the requested certified copies within the statutory 30-day period.'
    ]
    for (let rLine of rtiLines) {
      page.drawText(rLine, { x: 45, y, size: 8.5, font: fontNorm, color: darkSlate })
      y -= 14
    }
  }

  // -------------------------------------------------------------
  // TEMPLATE 4: EMPLOYMENT DISPUTE & SALARY RECOVERY NOTICE
  // -------------------------------------------------------------
  else if (templateId === 'employment_grievance') {
    page.drawText('DEMAND NOTICE FOR UNPAID SALARY & EMPLOYMENT GRIEVANCE', {
      x: 35,
      y,
      size: 11,
      font: fontBold,
      color: navyColor
    })
    page.drawText('UNDER SECTION 15 PAYMENT OF WAGES ACT 1936 & INDUSTRIAL DISPUTES ACT 1947', {
      x: 35,
      y: y - 14,
      size: 8,
      font: fontOblique,
      color: darkSlate
    })
    y -= 32

    drawSectionHeader('EMPLOYEE & EMPLOYER PARTICULARS')
    drawRow('Employee Name', formData.employeeName)
    drawRow('Company Name', formData.companyName)
    drawRow('Designation', formData.designation)
    drawRow('Unpaid Period', formData.unpaidMonths)
    drawRow('Claim Amount', `INR ${formData.claimAmount || '0'}`)

    y -= 10
    drawTextBlock('EMPLOYMENT GRIEVANCE & DEFAULT STATEMENT', formData.employmentGrievance)

    drawSectionHeader('STATUTORY DEMAND & LABOUR COURT INTIMATION', alertRed)
    const empLines = [
      '1. Pay the full outstanding salary along with 18% p.a. statutory interest within 15 days of this notice.',
      '2. Issue the Experience Certificate and Relieving Letter without unauthorized deductions.',
      '3. In case of non-compliance, formal proceedings will be initiated before the Labour Commissioner & SAMADHAAN Portal.'
    ]
    for (let eLine of empLines) {
      page.drawText(eLine, { x: 45, y, size: 8.5, font: fontNorm, color: darkSlate })
      y -= 14
    }
  }

  // -------------------------------------------------------------
  // TEMPLATE 5: CONSUMER COURT PETITION
  // -------------------------------------------------------------
  else {
    page.drawText('BEFORE THE DISTRICT CONSUMER DISPUTES REDRESSAL COMMISSION', {
      x: 35,
      y,
      size: 11,
      font: fontBold,
      color: navyColor
    })
    page.drawText('PETITION UNDER SECTION 35 OF CONSUMER PROTECTION ACT, 2019', {
      x: 35,
      y: y - 14,
      size: 8,
      font: fontOblique,
      color: darkSlate
    })
    y -= 32

    drawSectionHeader('CONSUMER & OPPOSITE PARTY PARTICULARS')
    drawRow('Complainant Name', formData.consumerName)
    drawRow('Opposite Party', formData.sellerName)
    drawRow('Product / Service', formData.productService)
    drawRow('Purchase Date', formData.purchaseDate)
    drawRow('Invoice Number', formData.invoiceNumber)
    drawRow('Compensation Demanded', `INR ${formData.compensationSought || '0'}`)

    y -= 10
    drawTextBlock('STATEMENT OF DEFICIENCY OF SERVICE / DEFECT', formData.defectDetails)

    drawSectionHeader('PRAYER FOR RELIEF UNDER CONSUMER PROTECTION ACT 2019', alertRed)
    const conLines = [
      '1. Direct Opposite Party to refund full purchase amount with 12% interest from purchase date.',
      '2. Award compensation for severe financial inconvenience and mental harassment.',
      '3. Award litigation costs incurred by complainant.'
    ]
    for (let cLine of conLines) {
      page.drawText(cLine, { x: 45, y, size: 8.5, font: fontNorm, color: darkSlate })
      y -= 14
    }
  }

  // -------------------------------------------------------------
  // FOOTER & SIGNATURE BLOCK (ALL TEMPLATES)
  // -------------------------------------------------------------
  y = Math.min(y - 15, 130)

  // Verification Box
  page.drawRectangle({
    x: 35,
    y: y - 40,
    width: 250,
    height: 45,
    borderColor: borderGrey,
    borderWidth: 0.8
  })

  page.drawText('VERIFICATION DECLARATION', { x: 45, y: y - 10, size: 8, font: fontBold, color: navyColor })
  page.drawText('I verify that the facts stated above are true', { x: 45, y: y - 22, size: 7.5, font: fontNorm, color: darkSlate })
  page.drawText('and correct to the best of my knowledge.', { x: 45, y: y - 32, size: 7.5, font: fontNorm, color: darkSlate })

  // Signature Line
  page.drawLine({
    start: { x: width - 200, y: y - 25 },
    end: { x: width - 40, y: y - 25 },
    thickness: 1,
    color: darkSlate
  })

  page.drawText('SIGNATURE OF APPLICANT / COMPLAINANT', {
    x: width - 195,
    y: y - 36,
    size: 7.5,
    font: fontBold,
    color: navyColor
  })

  // Bottom Disclaimer Bar
  page.drawRectangle({
    x: 0,
    y: 0,
    width: width,
    height: 25,
    color: navyColor
  })

  page.drawText('Generated via NyayaMitra National AI Legal Aid System • Free Legal Services Authority (NALSA) Helpline: 15100', {
    x: 40,
    y: 8,
    size: 7.5,
    font: fontNorm,
    color: rgb(1, 1, 1)
  })

  const pdfBytes = await pdfDoc.save()
  return new Blob([pdfBytes], { type: 'application/pdf' })
}
