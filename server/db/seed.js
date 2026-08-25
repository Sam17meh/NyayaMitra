import 'dotenv/config'
import pg from 'pg'

const { Client } = pg
const client = new Client({ connectionString: process.env.DATABASE_URL })

const legalContexts = [
  {
    category: 'cyber_fraud',
    title: 'Online cheating and impersonation',
    lawReference: 'Information Technology Act, 2000; Bharatiya Nyaya Sanhita, 2023',
    summary: 'Fraudulent online representations, phishing, or impersonation used to obtain money or personal information may attract provisions dealing with computer-related offences, cheating, and cheating by personation.',
    applicableSections: 'IT Act sections 66D and 43; BNS sections 318(4) and 319',
    sourceUrl: 'https://www.indiacode.nic.in/handle/123456789/15285',
  },
  {
    category: 'cyber_fraud',
    title: 'Unauthorised access and data misuse',
    lawReference: 'Information Technology Act, 2000',
    summary: 'Unauthorised access, downloading, copying, disruption, or damage involving a computer resource can create civil liability and, where dishonest or fraudulent intent is present, criminal liability.',
    applicableSections: 'IT Act sections 43 and 66',
    sourceUrl: 'https://www.indiacode.nic.in/handle/123456789/1999',
  },
  {
    category: 'cyber_fraud',
    title: 'Identity theft and misuse of credentials',
    lawReference: 'Information Technology Act, 2000',
    summary: 'Using another person’s electronic signature, password, or unique identification feature without permission may constitute identity theft; fraudulent use of another person’s identity may also be relevant.',
    applicableSections: 'IT Act sections 66C and 66D',
    sourceUrl: 'https://www.indiacode.nic.in/handle/123456789/1999',
  },
  {
    category: 'harassment',
    title: 'Sexual harassment at the workplace',
    lawReference: 'Sexual Harassment of Women at Workplace Act, 2013',
    summary: 'Unwelcome conduct of a sexual nature at a workplace is prohibited. The Act provides an internal complaints process and safeguards against retaliation.',
    applicableSections: 'POSH Act sections 2(n), 3, 9, and 19',
    sourceUrl: 'https://www.indiacode.nic.in/handle/123456789/2104',
  },
  {
    category: 'harassment',
    title: 'Stalking and unwanted contact',
    lawReference: 'Bharatiya Nyaya Sanhita, 2023',
    summary: 'Repeatedly following or contacting a woman despite a clear indication of disinterest, or monitoring her internet, email, or other electronic communication, may constitute stalking.',
    applicableSections: 'BNS section 78',
    sourceUrl: 'https://www.indiacode.nic.in/handle/123456789/20062',
  },
  {
    category: 'harassment',
    title: 'Assault or criminal force against a woman',
    lawReference: 'Bharatiya Nyaya Sanhita, 2023',
    summary: 'Assault or criminal force against a woman with intent to outrage, or knowing it is likely to outrage, her modesty is a criminal offence.',
    applicableSections: 'BNS section 74',
    sourceUrl: 'https://www.indiacode.nic.in/handle/123456789/20062',
  },
  {
    category: 'property',
    title: 'Theft of movable property',
    lawReference: 'Bharatiya Nyaya Sanhita, 2023',
    summary: 'Dishonestly moving movable property out of another person’s possession without consent may constitute theft.',
    applicableSections: 'BNS section 303',
    sourceUrl: 'https://www.indiacode.nic.in/handle/123456789/20062',
  },
  {
    category: 'property',
    title: 'Sale or transfer of immovable property',
    lawReference: 'Transfer of Property Act, 1882',
    summary: 'A sale of tangible immovable property is generally made through a registered instrument, subject to the Act and other applicable law.',
    applicableSections: 'Transfer of Property Act sections 54 and 55',
    sourceUrl: 'https://www.indiacode.nic.in/handle/123456789/2189',
  },
  {
    category: 'property',
    title: 'Equal inheritance rights of daughters',
    lawReference: 'Hindu Succession Act, 1956',
    summary: 'A daughter is a coparcener by birth in a Mitakshara joint Hindu family, with the same rights and liabilities as a son, subject to the Act.',
    applicableSections: 'Hindu Succession Act section 6',
    sourceUrl: 'https://www.indiacode.nic.in/handle/123456789/1561',
  },
  {
    category: 'employment',
    title: 'Retrenchment without statutory compliance',
    lawReference: 'Industrial Disputes Act, 1947',
    summary: 'Retrenchment of a qualifying workman ordinarily requires compliance with statutory conditions including notice or pay in lieu and retrenchment compensation.',
    applicableSections: 'Industrial Disputes Act section 25F',
    sourceUrl: 'https://www.indiacode.nic.in/handle/123456789/1563',
  },
  {
    category: 'employment',
    title: 'Payment of gratuity',
    lawReference: 'Payment of Gratuity Act, 1972',
    summary: 'An eligible employee may claim gratuity on termination after the statutory qualifying service, subject to the Act’s exceptions and calculation rules.',
    applicableSections: 'Payment of Gratuity Act sections 4 and 7',
    sourceUrl: 'https://www.indiacode.nic.in/handle/123456789/1701',
  },
  {
    category: 'employment',
    title: 'Workplace sexual harassment complaint',
    lawReference: 'Sexual Harassment of Women at Workplace Act, 2013',
    summary: 'A woman facing unwelcome sexual conduct at work may submit a complaint to the Internal Committee or Local Committee under the statutory process.',
    applicableSections: 'POSH Act sections 9 and 11',
    sourceUrl: 'https://www.indiacode.nic.in/handle/123456789/2104',
  },
  {
    category: 'domestic',
    title: 'Domestic violence and available reliefs',
    lawReference: 'Protection of Women from Domestic Violence Act, 2005',
    summary: 'Domestic violence includes physical, sexual, verbal, emotional, and economic abuse. A Magistrate may grant protection, residence, monetary, custody, or compensation reliefs.',
    applicableSections: 'PWDVA sections 3, 12, 18, 19, 20, and 22',
    sourceUrl: 'https://www.indiacode.nic.in/handle/123456789/15436',
  },
  {
    category: 'domestic',
    title: 'Cruelty by husband or relatives',
    lawReference: 'Bharatiya Nyaya Sanhita, 2023',
    summary: 'Cruelty by a husband or his relative, including conduct likely to drive a woman to suicide or cause grave injury, is a criminal offence.',
    applicableSections: 'BNS sections 85 and 86',
    sourceUrl: 'https://www.indiacode.nic.in/handle/123456789/20062',
  },
  {
    category: 'domestic',
    title: 'Dowry demand or acceptance',
    lawReference: 'Dowry Prohibition Act, 1961',
    summary: 'Giving, taking, or demanding dowry is prohibited, subject to the Act’s definitions and exceptions.',
    applicableSections: 'Dowry Prohibition Act sections 3 and 4',
    sourceUrl: 'https://www.indiacode.nic.in/handle/123456789/1670',
  },
  {
    category: 'consumer',
    title: 'Consumer complaint for defective goods or deficient service',
    lawReference: 'Consumer Protection Act, 2019',
    summary: 'A consumer may file a complaint for defects in goods, deficiency in services, unfair trade practice, or other grounds recognised by the Act.',
    applicableSections: 'Consumer Protection Act sections 2(6), 2(11), 2(47), and 35',
    sourceUrl: 'https://www.indiacode.nic.in/handle/123456789/15256',
  },
  {
    category: 'consumer',
    title: 'Reliefs available from a Consumer Commission',
    lawReference: 'Consumer Protection Act, 2019',
    summary: 'Consumer Commissions may order repair, replacement, refund, compensation, discontinuance of unfair practices, and other statutory reliefs.',
    applicableSections: 'Consumer Protection Act section 39',
    sourceUrl: 'https://www.indiacode.nic.in/handle/123456789/15256',
  },
  {
    category: 'consumer',
    title: 'Product liability claim',
    lawReference: 'Consumer Protection Act, 2019',
    summary: 'A claimant may pursue product liability against a manufacturer, service provider, or seller where the statutory requirements for harm from a defective product are met.',
    applicableSections: 'Consumer Protection Act sections 82 to 87',
    sourceUrl: 'https://www.indiacode.nic.in/handle/123456789/15256',
  },
]

try {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not set')
  }

  await client.connect()
  await client.query('BEGIN')

  for (const context of legalContexts) {
    await client.query(
      `INSERT INTO legal_contexts
        (category, title, law_reference, summary, applicable_sections, source_url)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        context.category,
        context.title,
        context.lawReference,
        context.summary,
        context.applicableSections,
        context.sourceUrl,
      ],
    )
  }

  await client.query('COMMIT')
  console.log(`Seed completed successfully: inserted ${legalContexts.length} legal contexts.`)
} catch (error) {
  await client.query('ROLLBACK').catch(() => {})
  console.error('Database seed failed:', error.message)
  process.exitCode = 1
} finally {
  await client.end().catch(() => {})
}