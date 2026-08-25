import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'

/**
 * Generates an official, beautifully styled A4 PDF document for NyayaMitra legal templates.
 * 
 * @param {string} templateId - ID of template ('fraud_complaint', 'legal_notice', 'rti_application', 'employment_grievance', 'consumer_complaint')
 * @param {object} formData - Form input data supplied by user
 * @returns {Promise<Uint8Array>} - Generated PDF bytes
 */
export async function createLegalDocumentPDF(templateId, formData = {}) {
  const pdfDoc = await PDFDocument.create()
  const page = pdfDoc.addPage([595.28, 841.89]) // Standard A4 Dimensions: 595.28 x 841.89 pt
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
    borderRadius: 4
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

  // Helper for drawing section headers
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

  // Helper for drawing key-value rows
  const drawRow = (label, value) => {
    if (y < 70) return
    const valText = String(value || 'N/A')
    page.drawText(`${label}:`, { x: 45, y, size: 9, font: fontBold, color: darkSlate })
    
    // Word wrap value if long
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

  // Helper for long paragraph text block with word wrap
  const drawTextBlock = (label, text) => {
    drawSectionHeader(label)
    const content = String(text || 'No detailed statement provided.')
    const lines = content.split('\n')
    const marginX = 45
    const maxW = width - 90

    for (let rawLine of lines) {
      if (!rawLine.trim()) {
        y -= 6
        continue
      }
      const words = rawLine.split(' ')
      let line = ''
      for (let word of words) {
        const testLine = line ? `${line} ${word}` : word
        const testW = fontNorm.widthOfTextAtSize(testLine, 8.5)
        if (testW > maxW) {
          if (y < 65) break
          page.drawText(line, { x: marginX, y, size: 8.5, font: fontNorm, color: darkSlate })
          y -= 12
          line = word
        } else {
          line = testLine
        }
      }
      if (line && y >= 65) {
        page.drawText(line, { x: marginX, y, size: 8.5, font: fontNorm, color: darkSlate })
        y -= 14
      }
    }
    y -= 5
  }

  // -------------------------------------------------------------
  // DYNAMIC FORMAL AI LEGAL COURT PETITION RENDERING
  // -------------------------------------------------------------
  const addresseeText = formData.formalAddressee || (
    templateId === 'fraud_complaint' ? 'BEFORE THE OFFICER-IN-CHARGE, CYBER CRIME CELL / POLICE STATION' :
    templateId === 'legal_notice' ? `FORMAL LEGAL DEMAND NOTICE\nTO: ${formData.recipientName || 'RECIPIENT'}` :
    templateId === 'rti_application' ? `BEFORE THE PUBLIC INFORMATION OFFICER (PIO)\nDEPARTMENT: ${formData.publicAuthority || 'PUBLIC AUTHORITY'}` :
    templateId === 'employment_grievance' ? `BEFORE THE LABOUR COMMISSIONER / CONCILIATION OFFICER\nCOMPANY: ${formData.companyName || 'EMPLOYER'}` :
    'BEFORE THE DISTRICT CONSUMER DISPUTES REDRESSAL COMMISSION'
  )

  const subjectText = formData.formalSubject || (
    templateId === 'fraud_complaint' ? `SUBJECT: OFFICIAL COMPLAINT UNDER SECTION 66D IT ACT 2000 & SECTION 318 BNS 2023 FOR CYBER FRAUD OF INR ${formData.amountLost || '0'}` :
    templateId === 'legal_notice' ? `SUBJECT: FORMAL LEGAL DEMAND NOTICE FOR RECOVERY / DEFAULT: ${formData.noticeSubject || 'BREACH OF CONTRACT'}` :
    templateId === 'rti_application' ? `SUBJECT: APPLICATION FOR OBTAINING INFORMATION UNDER SECTION 6(1) OF RTI ACT 2005` :
    templateId === 'employment_grievance' ? `SUBJECT: DEMAND NOTICE FOR UNPAID SALARY & EMPLOYMENT GRIEVANCE` :
    `SUBJECT: PETITION UNDER SECTION 35 OF CONSUMER PROTECTION ACT 2019`
  )

  page.drawText(addresseeText.split('\n')[0], {
    x: 35,
    y,
    size: 10.5,
    font: fontBold,
    color: alertRed
  })
  y -= 18

  if (addresseeText.split('\n')[1]) {
    page.drawText(addresseeText.split('\n')[1], {
      x: 35,
      y,
      size: 9,
      font: fontBold,
      color: navyColor
    })
    y -= 16
  }

  page.drawText(subjectText, {
    x: 35,
    y,
    size: 8.5,
    font: fontBold,
    color: navyColor
  })
  y -= 24

  // 1. PARTICULARS TABLE
  drawSectionHeader('1. PARTIES & COMPLAINANT PARTICULARS')
  if (templateId === 'fraud_complaint') {
    drawRow('Complainant Name', formData.fullName)
    drawRow('Contact Phone', formData.contactPhone)
    drawRow('Bank / Platform', formData.bankName)
    drawRow('Incident Date', formData.transactionDate)
    drawRow('Monetary Loss (INR)', `INR ${formData.amountLost || '0'}`)
    drawRow('UTR / Ref Number', formData.utrReference || 'Pending Verification')
  } else if (templateId === 'legal_notice') {
    drawRow('From (Sender)', formData.senderName)
    drawRow('Sender Address', formData.senderAddress)
    drawRow('To (Recipient)', formData.recipientName)
    drawRow('Recipient Address', formData.recipientAddress)
    drawRow('Cure Deadline', formData.deadlineDays || '15 Days')
  } else if (templateId === 'rti_application') {
    drawRow('Applicant Name', formData.applicantName)
    drawRow('Public Authority', formData.publicAuthority)
    drawRow('Department Address', formData.departmentAddress)
    drawRow('Period of Info', formData.timePeriod)
    drawRow('Application Fee', `INR 10/- via ${formData.feeMode || 'Postal Order'}`)
  } else if (templateId === 'employment_grievance') {
    drawRow('Employee Name', formData.employeeName)
    drawRow('Company Name', formData.companyName)
    drawRow('Designation', formData.designation)
    drawRow('Unpaid Period', formData.unpaidMonths)
    drawRow('Claim Amount', `INR ${formData.unpaidSalary || formData.claimAmount || '0'}`)
  } else {
    drawRow('Complainant Name', formData.consumerName)
    drawRow('Opposite Party', formData.sellerName)
    drawRow('Product / Service', formData.productService)
    drawRow('Purchase Date', formData.purchaseDate)
    drawRow('Invoice Number', formData.invoiceNumber)
    drawRow('Compensation Demanded', `INR ${formData.claimAmount || formData.compensationSought || '0'}`)
  }

  y -= 8

  // 2. FORMAL STATEMENT OF FACTS & GROUNDS (AI REFINED)
  const factsText = formData.formalStatementOfFacts || (
    templateId === 'fraud_complaint' ? formData.incidentDescription :
    templateId === 'legal_notice' ? formData.disputeDetails :
    templateId === 'rti_application' ? formData.informationSought :
    templateId === 'employment_grievance' ? formData.employmentGrievance || formData.grievanceDetails :
    formData.defectDetails
  )

  drawTextBlock('2. FORMAL STATEMENT OF FACTS & STATUTORY GROUNDS', factsText)

  // 3. APPLICABLE STATUTORY PROVISIONS CITED
  if (y > 100) {
    drawSectionHeader('3. APPLICABLE LAWS & SECTIONS CITED')
    const sectionsText = formData.applicableSections || (
      templateId === 'fraud_complaint' ? 'Information Technology Act 2000 (Sec 43A, 66D); Bharatiya Nyaya Sanhita 2023 (Sec 318); RBI Guidelines 2017' :
      templateId === 'legal_notice' ? 'Order 37 Civil Procedure Code (CPC 1908); Bharatiya Nyaya Sanhita 2023 (Sec 316); Indian Contract Act 1872' :
      templateId === 'rti_application' ? 'Right to Information Act 2005 (Sec 6(1), Sec 7(1)); Constitution of India (Article 19(1)(a))' :
      templateId === 'employment_grievance' ? 'Payment of Wages Act 1936 (Sec 15); Industrial Disputes Act 1947 (Sec 25F); BNS 2023 (Sec 316)' :
      'Consumer Protection Act 2019 (Sec 2(47), Sec 35, Sec 84); Indian Contract Act 1872 (Sec 73)'
    )
    page.drawText(sectionsText, { x: 45, y, size: 8.5, font: fontOblique, color: navyColor })
    y -= 20
  }

  // 4. FORMAL PRAYER FOR RELIEF
  if (y > 90) {
    drawSectionHeader('4. FORMAL PRAYER FOR RELIEF & DEMAND', alertRed)
    const prayerContent = formData.formalPrayerForRelief || (
      templateId === 'fraud_complaint' ? 'PRAYER FOR RELIEF:\nWherefore, it is most respectfully prayed that this Hon\'ble Authority may be pleased to:\na) Register an official FIR under Section 318 BNS 2023;\nb) Issue urgent directives to freeze suspect node accounts;\nc) Order full restitution of funds under RBI Zero Customer Liability Guidelines.' :
      templateId === 'legal_notice' ? `PRAYER & DEMAND:\nYou are hereby called upon to satisfy the above grievance within ${formData.deadlineDays || '15 Days'}, failing which my Client shall initiate summary suit under Order 37 CPC at your sole cost and risk.` :
      templateId === 'rti_application' ? 'PRAYER:\nIt is requested that certified copies of the information sought above be furnished to the Applicant within the statutory 30-day period under Section 7(1) of RTI Act 2005.' :
      templateId === 'employment_grievance' ? 'PRAYER FOR RELIEF:\nIt is prayed that the Labour Authorities direct the Employer to release outstanding wages with 10x statutory compensation and interest thereon.' :
      'PRAYER FOR RELIEF:\na) Direct Opposite Party to refund full purchase amount with interest;\nb) Award compensation for severe financial inconvenience and mental harassment.'
    )

    const prayerLines = prayerContent.split('\n')
    for (let pLine of prayerLines) {
      if (y < 65) break
      page.drawText(pLine, { x: 45, y, size: 8.5, font: fontNorm, color: darkSlate })
      y -= 13
    }
  }

  // -------------------------------------------------------------
  // FOOTER & SIGNATURE BLOCK (ALL TEMPLATES)
  // -------------------------------------------------------------
  y = Math.min(y - 15, 120)

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

  return await pdfDoc.save()
}
