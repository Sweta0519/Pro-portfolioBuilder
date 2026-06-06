import { loadScript } from './utils/cdnLoader';
import { ResumeData } from './types';

let Document: any;
let Packer: any;
let Paragraph: any;
let TextRun: any;
let AlignmentType: any;
let Table: any;
let TableRow: any;
let TableCell: any;
let BorderStyle: any;
let WidthType: any;

export async function generateWordDocument(
  data: ResumeData,
  templateId: string = 'classic'
): Promise<Blob> {
  const docxLib = await loadScript(
    'https://cdn.jsdelivr.net/npm/docx@9.0.3/build/index.umd.min.js',
    'docx'
  );
  Document = docxLib.Document;
  Packer = docxLib.Packer;
  Paragraph = docxLib.Paragraph;
  TextRun = docxLib.TextRun;
  AlignmentType = docxLib.AlignmentType;
  Table = docxLib.Table;
  TableRow = docxLib.TableRow;
  TableCell = docxLib.TableCell;
  BorderStyle = docxLib.BorderStyle;
  WidthType = docxLib.WidthType;
  // Safe fallbacks for all data fields to prevent silent crashes
  const personal = data?.personal || {
    name: 'Resume',
    title: '',
    location: '',
    phone: '',
    email: '',
    bio: '',
    socials: {},
  };
  const socials = personal.socials || {};
  const experience = data?.experience || [];
  const skills = data?.skills || [];
  const education = data?.education || [];

  const tid = templateId.toLowerCase();

  // Margins in DXA (1 inch = 1440 dxa, 0.5 inch = 720 dxa)
  let topMargin = 720;
  let bottomMargin = 720;
  let leftMargin = 720;
  let rightMargin = 720;

  // Global document elements container
  let documentChildren: any[] = [];

  // Determine specific layout margins
  if (tid === 'compact') {
    topMargin = 500;
    bottomMargin = 500;
    leftMargin = 500;
    rightMargin = 500;
  } else if (tid === 'creative') {
    topMargin = 500;
    bottomMargin = 500;
    leftMargin = 500;
    rightMargin = 500;
  } else if (tid === 'minimal') {
    topMargin = 900;
    bottomMargin = 900;
    leftMargin = 900;
    rightMargin = 900;
  } else if (tid === 'stellar') {
    topMargin = 600;
    bottomMargin = 600;
    leftMargin = 600;
    rightMargin = 600;
  }

  // ==========================================
  // TEMPLATE 1: CLASSIC SERIF (Formal & Traditional)
  // ==========================================
  if (tid === 'classic') {
    const headingFont = 'Georgia';
    const bodyFont = 'Georgia';
    const primaryColor = '0F172A'; // Dark slate-900

    // Centered Header
    documentChildren.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 120, after: 60 },
        children: [
          new TextRun({
            text: personal.name.toUpperCase(),
            bold: true,
            size: 32,
            font: headingFont,
            color: primaryColor,
          }),
        ],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 120 },
        children: [
          new TextRun({
            text: personal.title,
            bold: true,
            italics: true,
            size: 20,
            font: headingFont,
            color: '475569',
          }),
        ],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 240 },
        children: [
          new TextRun({
            text: `${personal.location}   |   ${personal.phone}   |   ${personal.email}`,
            size: 18,
            font: bodyFont,
            color: '475569',
          }),
          ...(socials.linkedin
            ? [
                new TextRun({
                  text: `   |   LinkedIn: ${socials.linkedin.replace('https://', '')}`,
                  size: 18,
                  font: bodyFont,
                  color: '475569',
                }),
              ]
            : []),
        ],
      })
    );

    // Section Heading Builder
    const addClassicHeading = (title: string) => {
      return new Paragraph({
        spacing: { before: 240, after: 140 },
        border: {
          bottom: {
            color: '0F172A',
            space: 4,
            style: BorderStyle.DOUBLE,
            size: 18,
          },
        },
        children: [
          new TextRun({
            text: title.toUpperCase(),
            bold: true,
            size: 22,
            font: headingFont,
            color: primaryColor,
          }),
        ],
      });
    };

    // Summary Section
    if (personal.bio) {
      documentChildren.push(
        addClassicHeading('Professional Summary'),
        new Paragraph({
          alignment: AlignmentType.JUSTIFIED,
          spacing: { after: 200 },
          children: [
            new TextRun({
              text: personal.bio,
              size: 20,
              font: bodyFont,
              italics: true,
              color: '334155',
            }),
          ],
        })
      );
    }

    // Experience Section
    if (experience.length > 0) {
      documentChildren.push(addClassicHeading('Professional Experience'));

      experience.forEach((exp) => {
        documentChildren.push(
          new Paragraph({
            spacing: { before: 80, after: 40 },
            children: [
              new TextRun({
                text: exp.position,
                bold: true,
                size: 21,
                font: headingFont,
                color: primaryColor,
              }),
              new TextRun({
                text: `   |   ${exp.period}`,
                bold: true,
                size: 18,
                font: bodyFont,
                color: '475569',
              }),
            ],
          }),
          new Paragraph({
            spacing: { after: 80 },
            children: [
              new TextRun({
                text: `${exp.company}   •   ${exp.location}`,
                bold: true,
                italics: true,
                size: 19,
                font: bodyFont,
                color: '475569',
              }),
            ],
          }),
          // Bullet descriptions
          ...exp.description.map(
            (bullet) =>
              new Paragraph({
                bullet: { level: 0 },
                spacing: { after: 60 },
                alignment: AlignmentType.JUSTIFIED,
                children: [
                  new TextRun({
                    text: bullet,
                    size: 20,
                    font: bodyFont,
                    color: '334155',
                  }),
                ],
              })
          ),
          new Paragraph({ spacing: { after: 120 } })
        );
      });
    }

    // Bottom Grid Section: Left Education, Right Skills
    const educationChildren: any[] = [
      new Paragraph({
        spacing: { before: 120, after: 120 },
        border: { bottom: { color: '0F172A', space: 4, style: BorderStyle.SINGLE, size: 12 } },
        children: [
          new TextRun({
            text: 'EDUCATION',
            bold: true,
            size: 21,
            font: headingFont,
            color: primaryColor,
          }),
        ],
      }),
    ];

    education.forEach((edu) => {
      educationChildren.push(
        new Paragraph({
          spacing: { before: 60, after: 40 },
          children: [
            new TextRun({
              text: edu.degree,
              bold: true,
              size: 20,
              font: headingFont,
              color: '1E293B',
            }),
          ],
        }),
        new Paragraph({
          spacing: { after: 40 },
          children: [
            new TextRun({ text: edu.fieldOfStudy, size: 19, font: bodyFont, color: '475569' }),
          ],
        }),
        new Paragraph({
          spacing: { after: 120 },
          children: [
            new TextRun({
              text: `${edu.institution} | ${edu.period}`,
              italics: true,
              size: 18,
              font: bodyFont,
              color: '64748B',
            }),
          ],
        })
      );
    });

    const skillsChildren: any[] = [
      new Paragraph({
        spacing: { before: 120, after: 120 },
        border: { bottom: { color: '0F172A', space: 4, style: BorderStyle.SINGLE, size: 12 } },
        children: [
          new TextRun({
            text: 'SKILLS & EXPERTISE',
            bold: true,
            size: 21,
            font: headingFont,
            color: primaryColor,
          }),
        ],
      }),
    ];

    const groupedSkills = skills.reduce(
      (acc, s) => {
        if (!s) return acc;
        const cat = s.category || 'Other';
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(s.name);
        return acc;
      },
      {} as Record<string, string[]>
    );

    Object.entries(groupedSkills).forEach(([cat, names]) => {
      skillsChildren.push(
        new Paragraph({
          spacing: { after: 80 },
          children: [
            new TextRun({
              text: `${cat}: `,
              bold: true,
              size: 19,
              font: headingFont,
              color: primaryColor,
            }),
            new TextRun({ text: names.join(', '), size: 19, font: bodyFont, color: '334155' }),
          ],
        })
      );
    });

    // Add 2-column table at the bottom
    documentChildren.push(
      new Table({
        width: { size: 10800, type: WidthType.DXA },
        borders: {
          top: { style: BorderStyle.NONE },
          bottom: { style: BorderStyle.NONE },
          left: { style: BorderStyle.NONE },
          right: { style: BorderStyle.NONE },
          insideHorizontal: { style: BorderStyle.NONE },
          insideVertical: { style: BorderStyle.NONE },
        },
        rows: [
          new TableRow({
            children: [
              new TableCell({
                width: { size: 5400, type: WidthType.DXA },
                margins: { right: 240 },
                children: educationChildren,
              }),
              new TableCell({
                width: { size: 5400, type: WidthType.DXA },
                margins: { left: 240 },
                children: skillsChildren,
              }),
            ],
          }),
        ],
      })
    );
  }

  // ==========================================
  // TEMPLATE 2: MODERN SANS (Clean & Indigo Accents)
  // ==========================================
  else if (tid === 'modern') {
    const headingFont = 'Segoe UI';
    const bodyFont = 'Segoe UI';
    const primaryColor = '4F46E5'; // Indigo-600
    const darkSlate = '1E293B';

    // Header Table (2 columns: left name/title, right contact)
    documentChildren.push(
      new Table({
        width: { size: 10800, type: WidthType.DXA },
        borders: {
          top: { style: BorderStyle.NONE },
          bottom: { style: BorderStyle.SINGLE, size: 18, color: '0F172A' },
          left: { style: BorderStyle.NONE },
          right: { style: BorderStyle.NONE },
        },
        rows: [
          new TableRow({
            children: [
              new TableCell({
                width: { size: 7020, type: WidthType.DXA },
                margins: { bottom: 120 },
                children: [
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: personal.name.toUpperCase(),
                        bold: true,
                        size: 36,
                        font: headingFont,
                        color: darkSlate,
                      }),
                    ],
                  }),
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: personal.title,
                        bold: true,
                        size: 20,
                        font: headingFont,
                        color: primaryColor,
                      }),
                    ],
                  }),
                ],
              }),
              new TableCell({
                width: { size: 3780, type: WidthType.DXA },
                margins: { bottom: 120 },
                children: [
                  new Paragraph({
                    alignment: AlignmentType.RIGHT,
                    spacing: { after: 40 },
                    children: [
                      new TextRun({
                        text: personal.email,
                        size: 18,
                        font: bodyFont,
                        color: '64748B',
                      }),
                    ],
                  }),
                  new Paragraph({
                    alignment: AlignmentType.RIGHT,
                    spacing: { after: 40 },
                    children: [
                      new TextRun({
                        text: personal.phone,
                        size: 18,
                        font: bodyFont,
                        color: '64748B',
                      }),
                    ],
                  }),
                  new Paragraph({
                    alignment: AlignmentType.RIGHT,
                    children: [
                      new TextRun({
                        text: personal.location,
                        size: 18,
                        font: bodyFont,
                        color: '64748B',
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
      new Paragraph({ spacing: { after: 180 } })
    );

    // Summary inside beautiful single-cell shaded table matching HTML design
    if (personal.bio) {
      documentChildren.push(
        new Table({
          width: { size: 10800, type: WidthType.DXA },
          borders: {
            top: { style: BorderStyle.NONE },
            bottom: { style: BorderStyle.NONE },
            left: { style: BorderStyle.NONE },
            right: { style: BorderStyle.NONE },
          },
          rows: [
            new TableRow({
              children: [
                new TableCell({
                  width: { size: 10800, type: WidthType.DXA },
                  shading: { fill: 'F0F2FF' }, // Light indigo
                  margins: { top: 200, bottom: 200, left: 240, right: 240 },
                  children: [
                    new Paragraph({
                      spacing: { after: 80 },
                      children: [
                        new TextRun({
                          text: 'PROFESSIONAL SUMMARY',
                          bold: true,
                          size: 18,
                          font: headingFont,
                          color: primaryColor,
                        }),
                      ],
                    }),
                    new Paragraph({
                      alignment: AlignmentType.JUSTIFIED,
                      children: [
                        new TextRun({
                          text: personal.bio,
                          size: 20,
                          font: bodyFont,
                          color: '334155',
                        }),
                      ],
                    }),
                  ],
                }),
              ],
            }),
          ],
        }),
        new Paragraph({ spacing: { after: 200 } })
      );
    }

    // 2-Column Main Layout: Left experience, Right skills/edu
    const leftColChildren: any[] = [];
    const rightColChildren: any[] = [];

    // Left Column Content: Experience
    leftColChildren.push(
      new Paragraph({
        spacing: { before: 120, after: 180 },
        children: [
          new TextRun({
            text: 'EXPERIENCE',
            bold: true,
            size: 20,
            font: headingFont,
            color: primaryColor,
            shading: { fill: 'EEF2F6' },
          }),
        ],
      })
    );

    experience.forEach((exp) => {
      leftColChildren.push(
        new Paragraph({
          spacing: { before: 80, after: 40 },
          children: [
            new TextRun({
              text: exp.position,
              bold: true,
              size: 21,
              font: headingFont,
              color: darkSlate,
            }),
            new TextRun({
              text: `   |   ${exp.period}`,
              bold: true,
              size: 17,
              font: headingFont,
              color: primaryColor,
            }),
          ],
        }),
        new Paragraph({
          spacing: { after: 80 },
          children: [
            new TextRun({
              text: `${exp.company}  •  ${exp.location}`,
              bold: true,
              size: 19,
              font: bodyFont,
              color: '64748B',
            }),
          ],
        }),
        // Arrow bullets
        ...exp.description.map(
          (bullet) =>
            new Paragraph({
              spacing: { after: 60 },
              alignment: AlignmentType.JUSTIFIED,
              children: [
                new TextRun({
                  text: '→   ',
                  bold: true,
                  color: primaryColor,
                  font: bodyFont,
                }),
                new TextRun({
                  text: bullet,
                  size: 19,
                  font: bodyFont,
                  color: '334155',
                }),
              ],
            })
        ),
        new Paragraph({ spacing: { after: 160 } })
      );
    });

    // Right Column Content: Skills with visual badges
    rightColChildren.push(
      new Paragraph({
        spacing: { before: 120, after: 120 },
        border: { bottom: { color: darkSlate, space: 4, style: BorderStyle.SINGLE, size: 12 } },
        children: [
          new TextRun({
            text: 'CORE SKILLS',
            bold: true,
            size: 20,
            font: headingFont,
            color: darkSlate,
          }),
        ],
      })
    );

    // Render skill items as simulated tags with shading
    const skillParagraphs: Paragraph[] = [];
    let currentRuns: any[] = [];

    skills.forEach((s, idx) => {
      currentRuns.push(
        new TextRun({
          text: `  ${s.name}  `,
          bold: true,
          size: 17,
          font: bodyFont,
          color: '334155',
          shading: { fill: 'F1F5F9' },
        })
      );

      // Every 2 items or at the end, insert paragraph
      if (currentRuns.length === 2 || idx === skills.length - 1) {
        skillParagraphs.push(
          new Paragraph({
            spacing: { after: 80 },
            children: [...currentRuns],
          })
        );
        currentRuns = [];
      } else {
        currentRuns.push(new TextRun({ text: '  ' })); // tag separator space
      }
    });

    rightColChildren.push(...skillParagraphs, new Paragraph({ spacing: { after: 160 } }));

    // Right Column: Education
    rightColChildren.push(
      new Paragraph({
        spacing: { before: 120, after: 120 },
        border: { bottom: { color: darkSlate, space: 4, style: BorderStyle.SINGLE, size: 12 } },
        children: [
          new TextRun({
            text: 'EDUCATION',
            bold: true,
            size: 20,
            font: headingFont,
            color: darkSlate,
          }),
        ],
      })
    );

    education.forEach((edu) => {
      rightColChildren.push(
        new Paragraph({
          spacing: { before: 60, after: 40 },
          children: [
            new TextRun({
              text: edu.degree,
              bold: true,
              size: 19,
              font: headingFont,
              color: darkSlate,
            }),
          ],
        }),
        new Paragraph({
          spacing: { after: 40 },
          children: [
            new TextRun({ text: edu.fieldOfStudy, size: 18, font: bodyFont, color: '475569' }),
          ],
        }),
        new Paragraph({
          spacing: { after: 40 },
          children: [
            new TextRun({
              text: edu.institution,
              italics: true,
              size: 18,
              font: bodyFont,
              color: '64748B',
            }),
          ],
        }),
        new Paragraph({
          spacing: { after: 120 },
          children: [
            new TextRun({
              text: edu.period,
              bold: true,
              size: 17,
              font: bodyFont,
              color: primaryColor,
            }),
          ],
        })
      );
    });

    // Outer Layout Table to assemble left/right columns
    documentChildren.push(
      new Table({
        width: { size: 10800, type: WidthType.DXA },
        borders: {
          top: { style: BorderStyle.NONE },
          bottom: { style: BorderStyle.NONE },
          left: { style: BorderStyle.NONE },
          right: { style: BorderStyle.NONE },
          insideHorizontal: { style: BorderStyle.NONE },
          insideVertical: { style: BorderStyle.NONE },
        },
        rows: [
          new TableRow({
            children: [
              new TableCell({
                width: { size: 7020, type: WidthType.DXA },
                margins: { right: 180 },
                children: leftColChildren,
              }),
              new TableCell({
                width: { size: 3780, type: WidthType.DXA },
                margins: { left: 180 },
                children: rightColChildren,
              }),
            ],
          }),
        ],
      })
    );
  }

  // ==========================================
  // TEMPLATE 3: COMPACT GRID (Space Optimized Sidebar)
  // ==========================================
  else if (tid === 'compact') {
    const headingFont = 'Arial';
    const bodyFont = 'Arial';
    const primaryColor = '0F172A';

    const sidebarChildren: any[] = [];
    const mainChildren: any[] = [];

    // Left Sidebar: Personal info, Contact, Skills tags, Education
    sidebarChildren.push(
      new Paragraph({
        spacing: { before: 80, after: 40 },
        children: [
          new TextRun({
            text: personal.name,
            bold: true,
            size: 26,
            font: headingFont,
            color: '0F172A',
          }),
        ],
      }),
      new Paragraph({
        spacing: { after: 180 },
        children: [
          new TextRun({
            text: personal.title.toUpperCase(),
            bold: true,
            size: 15,
            font: headingFont,
            color: '64748B',
          }),
        ],
      }),
      // Contact
      new Paragraph({
        spacing: { after: 60 },
        children: [
          new TextRun({ text: '📍 ', size: 16 }),
          new TextRun({ text: personal.location, size: 17, font: bodyFont, color: '475569' }),
        ],
      }),
      new Paragraph({
        spacing: { after: 60 },
        children: [
          new TextRun({ text: '📞 ', size: 16 }),
          new TextRun({ text: personal.phone, size: 17, font: bodyFont, color: '475569' }),
        ],
      }),
      new Paragraph({
        spacing: { after: 180 },
        children: [
          new TextRun({ text: '✉️ ', size: 16 }),
          new TextRun({ text: personal.email, size: 16, font: bodyFont, color: '475569' }),
        ],
      }),
      // Sidebar Skills
      new Paragraph({
        spacing: { before: 180, after: 80 },
        border: { bottom: { color: 'CBD5E1', space: 2, style: BorderStyle.SINGLE, size: 6 } },
        children: [
          new TextRun({
            text: 'SKILLS',
            bold: true,
            size: 17,
            font: headingFont,
            color: primaryColor,
          }),
        ],
      })
    );

    skills.forEach((s) => {
      sidebarChildren.push(
        new Paragraph({
          spacing: { after: 40 },
          children: [
            new TextRun({
              text: `▪  ${s.name}`,
              bold: true,
              size: 16,
              font: bodyFont,
              color: '334155',
            }),
          ],
        })
      );
    });

    // Sidebar Education
    sidebarChildren.push(
      new Paragraph({
        spacing: { before: 180, after: 80 },
        border: { bottom: { color: 'CBD5E1', space: 2, style: BorderStyle.SINGLE, size: 6 } },
        children: [
          new TextRun({
            text: 'EDUCATION',
            bold: true,
            size: 17,
            font: headingFont,
            color: primaryColor,
          }),
        ],
      })
    );

    education.forEach((edu) => {
      sidebarChildren.push(
        new Paragraph({
          spacing: { before: 40, after: 20 },
          children: [
            new TextRun({
              text: edu.degree,
              bold: true,
              size: 17,
              font: headingFont,
              color: '0F172A',
            }),
          ],
        }),
        new Paragraph({
          spacing: { after: 20 },
          children: [
            new TextRun({ text: edu.fieldOfStudy, size: 16, font: bodyFont, color: '475569' }),
          ],
        }),
        new Paragraph({
          spacing: { after: 20 },
          children: [
            new TextRun({
              text: edu.institution,
              bold: true,
              size: 16,
              font: bodyFont,
              color: '94A3B8',
            }),
          ],
        }),
        new Paragraph({
          spacing: { after: 80 },
          children: [new TextRun({ text: edu.period, size: 15, font: bodyFont, color: '94A3B8' })],
        })
      );
    });

    // Right Cell Main Children: Summary, Experience
    if (personal.bio) {
      mainChildren.push(
        new Paragraph({
          spacing: { before: 80, after: 80 },
          border: { bottom: { color: '0F172A', space: 4, style: BorderStyle.SINGLE, size: 12 } },
          children: [
            new TextRun({
              text: 'PROFESSIONAL SUMMARY',
              bold: true,
              size: 18,
              font: headingFont,
              color: primaryColor,
            }),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.JUSTIFIED,
          spacing: { after: 180 },
          children: [
            new TextRun({
              text: personal.bio,
              size: 19,
              font: bodyFont,
              color: '334155',
            }),
          ],
        })
      );
    }

    if (experience.length > 0) {
      mainChildren.push(
        new Paragraph({
          spacing: { before: 120, after: 80 },
          border: { bottom: { color: '0F172A', space: 4, style: BorderStyle.SINGLE, size: 12 } },
          children: [
            new TextRun({
              text: 'EXPERIENCE',
              bold: true,
              size: 18,
              font: headingFont,
              color: primaryColor,
            }),
          ],
        })
      );

      experience.forEach((exp) => {
        mainChildren.push(
          new Paragraph({
            spacing: { before: 60, after: 40 },
            children: [
              new TextRun({
                text: exp.position,
                bold: true,
                size: 19,
                font: headingFont,
                color: '0F172A',
              }),
              new TextRun({
                text: `   |   ${exp.period.toUpperCase()}`,
                bold: true,
                size: 15,
                font: headingFont,
                color: '94A3B8',
              }),
            ],
          }),
          new Paragraph({
            spacing: { after: 60 },
            children: [
              new TextRun({
                text: `${exp.company}  •  ${exp.location}`,
                bold: true,
                size: 18,
                font: bodyFont,
                color: '475569',
              }),
            ],
          }),
          ...exp.description.map(
            (bullet) =>
              new Paragraph({
                bullet: { level: 0 },
                spacing: { after: 40 },
                alignment: AlignmentType.JUSTIFIED,
                children: [
                  new TextRun({
                    text: bullet,
                    size: 18,
                    font: bodyFont,
                    color: '334155',
                  }),
                ],
              })
          ),
          new Paragraph({ spacing: { after: 120 } })
        );
      });
    }

    // Outer layout Table compiling left sidebar and right content
    documentChildren.push(
      new Table({
        width: { size: 11240, type: WidthType.DXA },
        borders: {
          top: { style: BorderStyle.NONE },
          bottom: { style: BorderStyle.NONE },
          left: { style: BorderStyle.NONE },
          right: { style: BorderStyle.NONE },
          insideHorizontal: { style: BorderStyle.NONE },
          insideVertical: { style: BorderStyle.NONE },
        },
        rows: [
          new TableRow({
            children: [
              new TableCell({
                width: { size: 3934, type: WidthType.DXA },
                shading: { fill: 'F8FAFC' }, // sidebar bg
                margins: { top: 200, bottom: 200, left: 200, right: 200 },
                borders: {
                  right: { style: BorderStyle.SINGLE, size: 6, color: 'CBD5E1' },
                },
                children: sidebarChildren,
              }),
              new TableCell({
                width: { size: 7306, type: WidthType.DXA },
                margins: { top: 200, bottom: 200, left: 240, right: 100 },
                children: mainChildren,
              }),
            ],
          }),
        ],
      })
    );
  }

  // ==========================================
  // TEMPLATE 4: EXECUTIVE (Bold & Authoritative Banner)
  // ==========================================
  else if (tid === 'executive') {
    const headingFont = 'Calibri';
    const bodyFont = 'Calibri';
    const primaryColor = '1E293B';
    const secondaryColor = '475569';

    // Top Dark Slate Full-Width Banner
    documentChildren.push(
      new Table({
        width: { size: 10800, type: WidthType.DXA },
        borders: {
          top: { style: BorderStyle.NONE },
          bottom: { style: BorderStyle.NONE },
          left: { style: BorderStyle.NONE },
          right: { style: BorderStyle.NONE },
          insideHorizontal: { style: BorderStyle.NONE },
          insideVertical: { style: BorderStyle.NONE },
        },
        rows: [
          new TableRow({
            children: [
              new TableCell({
                width: { size: 10800, type: WidthType.DXA },
                shading: { fill: '0F172A' }, // Executive Banner Color
                margins: { top: 300, bottom: 300, left: 300, right: 300 },
                children: [
                  new Paragraph({
                    alignment: AlignmentType.CENTER,
                    spacing: { after: 40 },
                    children: [
                      new TextRun({
                        text: personal.name.toUpperCase(),
                        bold: true,
                        size: 38,
                        font: headingFont,
                        color: 'FFFFFF',
                      }),
                    ],
                  }),
                  new Paragraph({
                    alignment: AlignmentType.CENTER,
                    spacing: { after: 80 },
                    children: [
                      new TextRun({
                        text: personal.title.toUpperCase(),
                        bold: true,
                        size: 20,
                        font: headingFont,
                        color: '94A3B8',
                      }),
                    ],
                  }),
                  new Paragraph({
                    alignment: AlignmentType.CENTER,
                    children: [
                      new TextRun({
                        text: `✉️ ${personal.email}    📞 ${personal.phone}    📍 ${personal.location}`,
                        size: 17,
                        font: bodyFont,
                        color: 'CBD5E1',
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
      new Paragraph({ spacing: { after: 200 } })
    );

    // Section Heading Helper
    const addExecutiveHeading = (title: string) => {
      return new Paragraph({
        spacing: { before: 180, after: 120 },
        border: { bottom: { color: '1E293B', space: 6, style: BorderStyle.SINGLE, size: 18 } },
        children: [
          new TextRun({
            text: title.toUpperCase(),
            bold: true,
            size: 21,
            font: headingFont,
            color: '1E293B',
          }),
        ],
      });
    };

    // Summary
    if (personal.bio) {
      documentChildren.push(
        addExecutiveHeading('Professional Summary'),
        new Paragraph({
          alignment: AlignmentType.JUSTIFIED,
          spacing: { after: 180 },
          children: [
            new TextRun({
              text: personal.bio,
              size: 20,
              font: bodyFont,
              color: '334155',
            }),
          ],
        })
      );
    }

    // Experience
    if (experience.length > 0) {
      documentChildren.push(addExecutiveHeading('Leadership Experience'));

      experience.forEach((exp) => {
        documentChildren.push(
          new Paragraph({
            spacing: { before: 80, after: 40 },
            children: [
              new TextRun({
                text: exp.position,
                bold: true,
                size: 22,
                font: headingFont,
                color: '1E293B',
              }),
              new TextRun({
                text: `   |   ${exp.period.toUpperCase()}`,
                bold: true,
                size: 16,
                font: headingFont,
                color: '475569',
              }),
            ],
          }),
          new Paragraph({
            spacing: { before: 40, after: 60 },
            children: [
              new TextRun({
                text: `${exp.company}  |  ${exp.location}`,
                bold: true,
                size: 20,
                font: bodyFont,
                color: secondaryColor,
              }),
            ],
          }),
          ...exp.description.map(
            (bullet) =>
              new Paragraph({
                bullet: { level: 0 },
                spacing: { after: 60 },
                alignment: AlignmentType.JUSTIFIED,
                children: [
                  new TextRun({
                    text: bullet,
                    size: 20,
                    font: bodyFont,
                    color: '334155',
                  }),
                ],
              })
          ),
          new Paragraph({ spacing: { after: 140 } })
        );
      });
    }

    // Bottom Grid Section: Left Academic, Right Core Competencies
    const eduChildren: any[] = [
      new Paragraph({
        spacing: { before: 100, after: 100 },
        border: { bottom: { color: '1E293B', space: 4, style: BorderStyle.SINGLE, size: 12 } },
        children: [
          new TextRun({
            text: 'ACADEMIC BACKGROUND',
            bold: true,
            size: 18,
            font: headingFont,
            color: primaryColor,
          }),
        ],
      }),
    ];

    education.forEach((edu) => {
      eduChildren.push(
        new Paragraph({
          spacing: { before: 40, after: 20 },
          children: [
            new TextRun({
              text: edu.degree,
              bold: true,
              size: 20,
              font: headingFont,
              color: '1E293B',
            }),
          ],
        }),
        new Paragraph({
          spacing: { after: 20 },
          children: [
            new TextRun({ text: edu.fieldOfStudy, size: 18, font: bodyFont, color: '475569' }),
          ],
        }),
        new Paragraph({
          spacing: { after: 100 },
          children: [
            new TextRun({
              text: `${edu.institution} | ${edu.period}`,
              italics: true,
              size: 18,
              font: bodyFont,
              color: '64748B',
            }),
          ],
        })
      );
    });

    const compChildren: any[] = [
      new Paragraph({
        spacing: { before: 100, after: 100 },
        border: { bottom: { color: '1E293B', space: 4, style: BorderStyle.SINGLE, size: 12 } },
        children: [
          new TextRun({
            text: 'CORE COMPETENCIES',
            bold: true,
            size: 18,
            font: headingFont,
            color: primaryColor,
          }),
        ],
      }),
    ];

    // Render competencies in nice bordered tags
    const competencyParagraphs: Paragraph[] = [];
    let currentCompRuns: any[] = [];

    skills.forEach((s, idx) => {
      currentCompRuns.push(
        new TextRun({
          text: `  ${s.name}  `,
          bold: true,
          size: 17,
          font: bodyFont,
          color: '0F172A',
          shading: { fill: 'F1F5F9' },
        })
      );

      if (currentCompRuns.length === 2 || idx === skills.length - 1) {
        competencyParagraphs.push(
          new Paragraph({
            spacing: { after: 60 },
            children: [...currentCompRuns],
          })
        );
        currentCompRuns = [];
      } else {
        currentCompRuns.push(new TextRun({ text: '  ' })); // Tag gap
      }
    });

    compChildren.push(...competencyParagraphs);

    documentChildren.push(
      new Table({
        width: { size: 10800, type: WidthType.DXA },
        borders: {
          top: { style: BorderStyle.NONE },
          bottom: { style: BorderStyle.NONE },
          left: { style: BorderStyle.NONE },
          right: { style: BorderStyle.NONE },
          insideHorizontal: { style: BorderStyle.NONE },
          insideVertical: { style: BorderStyle.NONE },
        },
        rows: [
          new TableRow({
            children: [
              new TableCell({
                width: { size: 5400, type: WidthType.DXA },
                margins: { right: 200 },
                children: eduChildren,
              }),
              new TableCell({
                width: { size: 5400, type: WidthType.DXA },
                margins: { left: 200 },
                children: compChildren,
              }),
            ],
          }),
        ],
      })
    );
  }

  // ==========================================
  // TEMPLATE 5: CREATIVE (Vibrant Sidebar, Skills Bars, Emerald Accents)
  // ==========================================
  else if (tid === 'creative') {
    const headingFont = 'Segoe UI';
    const bodyFont = 'Segoe UI';
    const emeraldAccent = '10B981';
    const darkSlate = '0F172A';

    const sideChildren: any[] = [];
    const mainChildren: any[] = [];

    // Avatar Initials Box (Simulated using single-cell padded table)
    sideChildren.push(
      new Table({
        width: { size: 1573, type: WidthType.DXA },
        borders: {
          top: { style: BorderStyle.NONE },
          bottom: { style: BorderStyle.NONE },
          left: { style: BorderStyle.NONE },
          right: { style: BorderStyle.NONE },
        },
        rows: [
          new TableRow({
            children: [
              new TableCell({
                width: { size: 1573, type: WidthType.DXA },
                shading: { fill: emeraldAccent },
                margins: { top: 120, bottom: 120, left: 120, right: 120 },
                children: [
                  new Paragraph({
                    alignment: AlignmentType.CENTER,
                    children: [
                      new TextRun({
                        text: personal.name.charAt(0).toUpperCase(),
                        bold: true,
                        size: 32,
                        font: headingFont,
                        color: 'FFFFFF',
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
      new Paragraph({ spacing: { after: 120 } }),
      new Paragraph({
        spacing: { after: 40 },
        children: [
          new TextRun({
            text: personal.name.toUpperCase(),
            bold: true,
            size: 28,
            font: headingFont,
            color: '0F172A',
          }),
        ],
      }),
      new Paragraph({
        spacing: { after: 200 },
        children: [
          new TextRun({
            text: personal.title.toUpperCase(),
            bold: true,
            size: 16,
            font: headingFont,
            color: '047857',
          }),
        ],
      })
    );

    // Sidebar: Connect Section
    sideChildren.push(
      new Paragraph({
        spacing: { before: 120, after: 100 },
        border: { bottom: { color: 'CBD5E1', space: 2, style: BorderStyle.SINGLE, size: 6 } },
        children: [
          new TextRun({
            text: 'CONNECT',
            bold: true,
            size: 17,
            font: headingFont,
            color: '475569',
          }),
        ],
      }),
      new Paragraph({
        spacing: { after: 60 },
        children: [
          new TextRun({ text: '📍 ', size: 15 }),
          new TextRun({ text: personal.location, size: 17, font: bodyFont, color: '334155' }),
        ],
      }),
      new Paragraph({
        spacing: { after: 60 },
        children: [
          new TextRun({ text: '📞 ', size: 15 }),
          new TextRun({ text: personal.phone, size: 17, font: bodyFont, color: '334155' }),
        ],
      }),
      new Paragraph({
        spacing: { after: 180 },
        children: [
          new TextRun({ text: '✉️ ', size: 15 }),
          new TextRun({ text: personal.email, size: 16, font: bodyFont, color: '334155' }),
        ],
      })
    );

    // Sidebar: Skills with simulated Progress Bars
    sideChildren.push(
      new Paragraph({
        spacing: { before: 120, after: 120 },
        border: { bottom: { color: 'CBD5E1', space: 2, style: BorderStyle.SINGLE, size: 6 } },
        children: [
          new TextRun({ text: 'SKILLS', bold: true, size: 17, font: headingFont, color: '475569' }),
        ],
      })
    );

    // Limit to 8 skills to prevent sidebar overflow
    skills.slice(0, 8).forEach((s) => {
      const level = s.level || 80;
      const filledCount = Math.min(10, Math.max(0, Math.round(level / 10)));
      const emptyCount = 10 - filledCount;

      sideChildren.push(
        new Paragraph({
          spacing: { before: 60, after: 40 },
          children: [
            new TextRun({ text: s.name, bold: true, size: 17, font: headingFont, color: '0F172A' }),
          ],
        }),
        new Paragraph({
          spacing: { after: 60 },
          children: [
            new TextRun({
              text: '■'.repeat(filledCount),
              bold: true,
              size: 15,
              font: headingFont,
              color: emeraldAccent,
            }),
            new TextRun({
              text: '■'.repeat(emptyCount),
              bold: true,
              size: 15,
              font: headingFont,
              color: 'E2E8F0',
            }),
          ],
        })
      );
    });

    // Sidebar: Education
    sideChildren.push(
      new Paragraph({
        spacing: { before: 120, after: 120 },
        border: { bottom: { color: 'CBD5E1', space: 2, style: BorderStyle.SINGLE, size: 6 } },
        children: [
          new TextRun({
            text: 'EDUCATION',
            bold: true,
            size: 17,
            font: headingFont,
            color: '475569',
          }),
        ],
      })
    );

    education.forEach((edu) => {
      sideChildren.push(
        new Paragraph({
          spacing: { before: 60, after: 20 },
          children: [
            new TextRun({
              text: edu.degree,
              bold: true,
              size: 17,
              font: headingFont,
              color: '0F172A',
            }),
          ],
        }),
        new Paragraph({
          spacing: { after: 20 },
          children: [
            new TextRun({ text: edu.fieldOfStudy, size: 16, font: bodyFont, color: '334155' }),
          ],
        }),
        new Paragraph({
          spacing: { after: 20 },
          children: [
            new TextRun({
              text: edu.institution,
              bold: true,
              size: 16,
              font: bodyFont,
              color: '475569',
            }),
          ],
        }),
        new Paragraph({
          spacing: { after: 80 },
          children: [
            new TextRun({
              text: edu.period,
              bold: true,
              size: 15,
              font: bodyFont,
              color: '047857',
            }),
          ],
        })
      );
    });

    // Right Content Main Column: Summary with Custom Bullet Accents
    const addCreativeHeading = (title: string) => {
      return new Paragraph({
        spacing: { before: 140, after: 140 },
        children: [
          new TextRun({
            text: '▪   ',
            bold: true,
            size: 26,
            font: headingFont,
            color: emeraldAccent,
          }),
          new TextRun({
            text: title.toUpperCase(),
            bold: true,
            size: 22,
            font: headingFont,
            color: darkSlate,
          }),
        ],
      });
    };

    if (personal.bio) {
      mainChildren.push(
        addCreativeHeading('Professional Summary'),
        new Paragraph({
          alignment: AlignmentType.JUSTIFIED,
          spacing: { after: 200 },
          children: [
            new TextRun({
              text: personal.bio,
              size: 20,
              font: bodyFont,
              color: '334155',
            }),
          ],
        })
      );
    }

    if (experience.length > 0) {
      mainChildren.push(addCreativeHeading('Experience'));

      experience.forEach((exp) => {
        mainChildren.push(
          new Paragraph({
            spacing: { before: 80, after: 40 },
            children: [
              new TextRun({
                text: exp.position,
                bold: true,
                size: 22,
                font: headingFont,
                color: darkSlate,
              }),
              new TextRun({
                text: `   |   ${exp.period.toUpperCase()}`,
                bold: true,
                size: 16,
                font: headingFont,
                color: '047857',
              }),
            ],
          }),
          new Paragraph({
            spacing: { before: 40, after: 60 },
            children: [
              new TextRun({
                text: `${exp.company}   •   ${exp.location}`,
                bold: true,
                size: 19,
                font: bodyFont,
                color: '94A3B8',
              }),
            ],
          }),
          ...exp.description.map(
            (bullet) =>
              new Paragraph({
                spacing: { after: 60 },
                alignment: AlignmentType.JUSTIFIED,
                children: [
                  new TextRun({
                    text: '▪   ', // Emerald styled block prefix
                    bold: true,
                    color: emeraldAccent,
                    font: bodyFont,
                  }),
                  new TextRun({
                    text: bullet,
                    size: 20,
                    font: bodyFont,
                    color: '334155',
                  }),
                ],
              })
          ),
          new Paragraph({ spacing: { after: 140 } })
        );
      });
    }

    // Creative 2-Column Outer Table Layout
    documentChildren.push(
      new Table({
        width: { size: 11240, type: WidthType.DXA },
        borders: {
          top: { style: BorderStyle.NONE },
          bottom: { style: BorderStyle.NONE },
          left: { style: BorderStyle.NONE },
          right: { style: BorderStyle.NONE },
          insideHorizontal: { style: BorderStyle.NONE },
          insideVertical: { style: BorderStyle.NONE },
        },
        rows: [
          new TableRow({
            children: [
              new TableCell({
                width: { size: 3934, type: WidthType.DXA },
                shading: { fill: 'F1F5F9' }, // Light silver-slate sidebar bg
                margins: { top: 240, bottom: 240, left: 240, right: 240 },
                children: sideChildren,
              }),
              new TableCell({
                width: { size: 7306, type: WidthType.DXA },
                margins: { top: 240, bottom: 240, left: 240, right: 100 },
                children: mainChildren,
              }),
            ],
          }),
        ],
      })
    );
  }

  // ==========================================
  // TEMPLATE 6: MINIMAL CLEAN (Ultra Spacious)
  // ==========================================
  else if (tid === 'minimal') {
    const headingFont = 'Segoe UI';
    const bodyFont = 'Segoe UI';
    const primaryColor = '1E293B';
    const lightSlate = '94A3B8';

    // Spacious centered header
    documentChildren.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 180, after: 60 },
        children: [
          new TextRun({
            text: personal.name.toUpperCase(),
            bold: true,
            size: 36,
            font: headingFont,
            color: primaryColor,
          }),
        ],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 120 },
        children: [
          new TextRun({
            text: personal.title.toUpperCase(),
            bold: true,
            size: 18,
            font: headingFont,
            color: lightSlate,
          }),
        ],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 240 },
        children: [
          new TextRun({
            text: `${personal.location.toUpperCase()}     ${personal.phone}     ${personal.email.toUpperCase()}`,
            size: 16,
            font: bodyFont,
            color: '64748B',
          }),
        ],
      })
    );

    // Centered Bio inside Quotes
    if (personal.bio) {
      documentChildren.push(
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 240 },
          children: [
            new TextRun({
              text: `"${personal.bio}"`,
              size: 20,
              font: bodyFont,
              italics: true,
              color: '475569',
            }),
          ],
        })
      );
    }

    const addMinimalHeading = (title: string) => {
      return new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 240, after: 180 },
        children: [
          new TextRun({
            text: title.toUpperCase(),
            bold: true,
            size: 18,
            font: headingFont,
            color: lightSlate,
          }),
        ],
      });
    };

    // Experience
    if (experience.length > 0) {
      documentChildren.push(addMinimalHeading('Experience'));

      experience.forEach((exp) => {
        documentChildren.push(
          new Paragraph({
            spacing: { before: 80, after: 40 },
            children: [
              new TextRun({
                text: exp.position,
                bold: true,
                size: 22,
                font: headingFont,
                color: '0F172A',
              }),
              new TextRun({
                text: `   |   ${exp.period.toUpperCase()}`,
                bold: true,
                size: 16,
                font: headingFont,
                color: lightSlate,
              }),
            ],
          }),
          new Paragraph({
            spacing: { before: 20, after: 60 },
            children: [
              new TextRun({
                text: `${exp.company}  •  ${exp.location}`,
                bold: true,
                size: 18,
                font: bodyFont,
                color: '94A3B8',
              }),
            ],
          }),
          ...exp.description.map(
            (bullet) =>
              new Paragraph({
                spacing: { after: 60 },
                alignment: AlignmentType.JUSTIFIED,
                children: [
                  new TextRun({
                    text: '──   ', // Thin clean line prefix
                    color: 'CBD5E1',
                    font: bodyFont,
                  }),
                  new TextRun({
                    text: bullet,
                    size: 20,
                    font: bodyFont,
                    color: '475569',
                  }),
                ],
              })
          ),
          new Paragraph({ spacing: { after: 180 } })
        );
      });
    }

    // Bottom Grid: Education and Skills
    const minEdu: any[] = [
      new Paragraph({
        spacing: { before: 120, after: 120 },
        children: [
          new TextRun({
            text: 'EDUCATION',
            bold: true,
            size: 18,
            font: headingFont,
            color: lightSlate,
          }),
        ],
      }),
    ];

    education.forEach((edu) => {
      minEdu.push(
        new Paragraph({
          spacing: { before: 40, after: 20 },
          children: [
            new TextRun({
              text: edu.degree,
              bold: true,
              size: 19,
              font: headingFont,
              color: '0F172A',
            }),
          ],
        }),
        new Paragraph({
          spacing: { after: 20 },
          children: [
            new TextRun({ text: edu.fieldOfStudy, size: 18, font: bodyFont, color: '475569' }),
          ],
        }),
        new Paragraph({
          spacing: { after: 120 },
          children: [
            new TextRun({
              text: `${edu.institution}  |  ${edu.period}`,
              bold: true,
              size: 16,
              font: bodyFont,
              color: lightSlate,
            }),
          ],
        })
      );
    });

    const minSkills: any[] = [
      new Paragraph({
        spacing: { before: 120, after: 120 },
        children: [
          new TextRun({
            text: 'EXPERTISE',
            bold: true,
            size: 18,
            font: headingFont,
            color: lightSlate,
          }),
        ],
      }),
    ];

    const skillList = skills.map((s) => s.name).join('   •   ');
    minSkills.push(
      new Paragraph({
        alignment: AlignmentType.JUSTIFIED,
        children: [
          new TextRun({
            text: skillList,
            size: 19,
            font: bodyFont,
            color: '64748B',
          }),
        ],
      })
    );

    documentChildren.push(
      new Table({
        width: { size: 10800, type: WidthType.DXA },
        borders: {
          top: { style: BorderStyle.NONE },
          bottom: { style: BorderStyle.NONE },
          left: { style: BorderStyle.NONE },
          right: { style: BorderStyle.NONE },
          insideHorizontal: { style: BorderStyle.NONE },
          insideVertical: { style: BorderStyle.NONE },
        },
        rows: [
          new TableRow({
            children: [
              new TableCell({
                width: { size: 5400, type: WidthType.DXA },
                margins: { right: 200 },
                children: minEdu,
              }),
              new TableCell({
                width: { size: 5400, type: WidthType.DXA },
                margins: { left: 200 },
                children: minSkills,
              }),
            ],
          }),
        ],
      })
    );
  }

  // ==========================================
  // TEMPLATE 7: STELLAR (Computer Terminal Navy/Green Dark Theme)
  // ==========================================
  else if (tid === 'stellar') {
    const headingFont = 'Consolas';
    const bodyFont = 'Consolas';
    const terminalGreen = '047857';
    const neonIndigo = '4F46E5';

    const innerDocument: any[] = [];

    // Header Dotted Container (Single-cell bordered table in dark navy shading)
    innerDocument.push(
      new Table({
        width: { size: 10440, type: WidthType.DXA },
        borders: {
          top: { style: BorderStyle.DOTTED, size: 12, color: '4F46E5' },
          bottom: { style: BorderStyle.DOTTED, size: 12, color: '4F46E5' },
          left: { style: BorderStyle.DOTTED, size: 12, color: '4F46E5' },
          right: { style: BorderStyle.DOTTED, size: 12, color: '4F46E5' },
        },
        rows: [
          new TableRow({
            children: [
              new TableCell({
                width: { size: 10440, type: WidthType.DXA },
                shading: { fill: 'E2E8F0' }, // light terminal-gray block
                margins: { top: 200, bottom: 200, left: 240, right: 240 },
                children: [
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: `${personal.name.toUpperCase()}_`,
                        bold: true,
                        size: 32,
                        font: headingFont,
                        color: '0F172A',
                      }),
                    ],
                  }),
                  new Paragraph({
                    spacing: { before: 40, after: 80 },
                    children: [
                      new TextRun({
                        text: `> ${personal.title.toUpperCase()}`,
                        bold: true,
                        size: 18,
                        font: headingFont,
                        color: '047857',
                      }),
                    ],
                  }),
                  new Paragraph({
                    spacing: { after: 120 },
                    children: [
                      new TextRun({
                        text: `CONTACT_EMAIL: ${personal.email}\nLOCATION: ${personal.location}`,
                        size: 16,
                        font: bodyFont,
                        color: '334155',
                      }),
                    ],
                  }),
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: personal.bio,
                        size: 18,
                        font: bodyFont,
                        italics: true,
                        color: '475569',
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
      new Paragraph({ spacing: { after: 200 } })
    );

    // Section Heading Helper
    const addStellarHeading = (title: string) => {
      return new Paragraph({
        spacing: { before: 180, after: 140 },
        children: [
          new TextRun({ text: '[ ', bold: true, size: 20, font: headingFont, color: '475569' }),
          new TextRun({
            text: title.toUpperCase(),
            bold: true,
            size: 21,
            font: headingFont,
            color: '047857',
          }),
          new TextRun({ text: ' ]', bold: true, size: 20, font: headingFont, color: '475569' }),
        ],
      });
    };

    // Experience
    if (experience.length > 0) {
      innerDocument.push(addStellarHeading('Experience'));

      experience.forEach((exp) => {
        innerDocument.push(
          new Paragraph({
            spacing: { before: 80, after: 40 },
            children: [
              new TextRun({
                text: exp.position,
                bold: true,
                size: 20,
                font: headingFont,
                color: '0F172A',
              }),
              new TextRun({
                text: `   |   ${exp.period.toUpperCase()}`,
                bold: true,
                size: 16,
                font: headingFont,
                color: '4F46E5',
              }),
            ],
          }),
          new Paragraph({
            spacing: { before: 20, after: 60 },
            children: [
              new TextRun({
                text: `${exp.company} // ${exp.location}`,
                bold: true,
                size: 17,
                font: bodyFont,
                color: '475569',
              }),
            ],
          }),
          // Lightning Bolt Bullet points
          ...exp.description.map(
            (bullet) =>
              new Paragraph({
                spacing: { after: 60 },
                alignment: AlignmentType.JUSTIFIED,
                children: [
                  new TextRun({
                    text: '⚡  ',
                    bold: true,
                    color: terminalGreen,
                    font: bodyFont,
                  }),
                  new TextRun({
                    text: bullet,
                    size: 18,
                    font: bodyFont,
                    color: '334155',
                  }),
                ],
              })
          ),
          new Paragraph({ spacing: { after: 120 } })
        );
      });
    }

    // Tech Stack & Education 2 columns
    const stellTech: any[] = [addStellarHeading('Tech_Stack')];

    skills.forEach((s) => {
      stellTech.push(
        new Paragraph({
          spacing: { after: 60 },
          children: [
            new TextRun({ text: '▪  ', bold: true, color: terminalGreen }),
            new TextRun({ text: s.name, bold: true, size: 17, font: bodyFont, color: '334155' }),
          ],
        })
      );
    });

    const stellEdu: any[] = [addStellarHeading('Education')];

    education.forEach((edu) => {
      stellEdu.push(
        new Table({
          width: { size: 5220, type: WidthType.DXA },
          borders: {
            top: { style: BorderStyle.SINGLE, size: 6, color: 'CBD5E1' },
            bottom: { style: BorderStyle.SINGLE, size: 6, color: 'CBD5E1' },
            left: { style: BorderStyle.SINGLE, size: 6, color: 'CBD5E1' },
            right: { style: BorderStyle.SINGLE, size: 6, color: 'CBD5E1' },
          },
          rows: [
            new TableRow({
              children: [
                new TableCell({
                  width: { size: 5220, type: WidthType.DXA },
                  shading: { fill: 'F1F5F9' },
                  margins: { top: 100, bottom: 100, left: 100, right: 100 },
                  children: [
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: edu.degree,
                          bold: true,
                          size: 18,
                          font: headingFont,
                          color: '0F172A',
                        }),
                      ],
                    }),
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: edu.fieldOfStudy,
                          size: 16,
                          font: bodyFont,
                          color: '334155',
                        }),
                      ],
                    }),
                    new Paragraph({
                      spacing: { before: 20 },
                      children: [
                        new TextRun({
                          text: edu.institution,
                          bold: true,
                          size: 16,
                          font: bodyFont,
                          color: neonIndigo,
                        }),
                      ],
                    }),
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: edu.period,
                          size: 15,
                          font: bodyFont,
                          color: '475569',
                        }),
                      ],
                    }),
                  ],
                }),
              ],
            }),
          ],
        }),
        new Paragraph({ spacing: { after: 120 } })
      );
    });

    innerDocument.push(
      new Table({
        width: { size: 10440, type: WidthType.DXA },
        borders: {
          top: { style: BorderStyle.NONE },
          bottom: { style: BorderStyle.NONE },
          left: { style: BorderStyle.NONE },
          right: { style: BorderStyle.NONE },
          insideHorizontal: { style: BorderStyle.NONE },
          insideVertical: { style: BorderStyle.NONE },
        },
        rows: [
          new TableRow({
            children: [
              new TableCell({
                width: { size: 5220, type: WidthType.DXA },
                margins: { right: 160 },
                children: stellTech,
              }),
              new TableCell({
                width: { size: 5220, type: WidthType.DXA },
                margins: { left: 160 },
                children: stellEdu,
              }),
            ],
          }),
        ],
      })
    );

    // Compile entire stellar document inside a dark terminal background table
    documentChildren.push(
      new Table({
        width: { size: 11040, type: WidthType.DXA },
        borders: {
          top: { style: BorderStyle.NONE },
          bottom: { style: BorderStyle.NONE },
          left: { style: BorderStyle.NONE },
          right: { style: BorderStyle.NONE },
          insideHorizontal: { style: BorderStyle.NONE },
          insideVertical: { style: BorderStyle.NONE },
        },
        rows: [
          new TableRow({
            children: [
              new TableCell({
                width: { size: 11040, type: WidthType.DXA },
                shading: { fill: 'F8FAFC' }, // Light Slate Terminal Background shading
                margins: { top: 300, bottom: 300, left: 300, right: 300 },
                children: innerDocument,
              }),
            ],
          }),
        ],
      })
    );
  }

  // ==========================================
  // TEMPLATE 8 / DEFAULT: PROFESSIONAL STANDARD (Original Centered Format)
  // ==========================================
  else {
    const headingFont = 'Times New Roman';
    const bodyFont = 'Times New Roman';
    const primaryColor = '000000';

    // Standard centered header
    documentChildren.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 120, after: 40 },
        children: [
          new TextRun({
            text: personal.name.toUpperCase(),
            bold: true,
            size: 28,
            font: headingFont,
            color: primaryColor,
          }),
        ],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 120 },
        children: [
          new TextRun({
            text: `${personal.location}   |   ${personal.phone}   |   ${personal.email}`,
            size: 18,
            font: bodyFont,
            color: primaryColor,
          }),
        ],
      })
    );

    const addOriginalHeading = (title: string) => {
      return new Paragraph({
        spacing: { before: 200, after: 100 },
        border: { bottom: { color: '000000', space: 2, style: BorderStyle.SINGLE, size: 8 } },
        children: [
          new TextRun({
            text: title.toUpperCase(),
            bold: true,
            size: 19,
            font: headingFont,
            color: primaryColor,
          }),
        ],
      });
    };

    // Summary
    if (personal.bio) {
      documentChildren.push(
        addOriginalHeading('Summary'),
        new Paragraph({
          alignment: AlignmentType.JUSTIFIED,
          spacing: { after: 140 },
          children: [
            new TextRun({
              text: personal.bio,
              size: 20,
              font: bodyFont,
              color: primaryColor,
            }),
          ],
        })
      );
    }

    // Experience
    if (experience.length > 0) {
      documentChildren.push(addOriginalHeading('Experience'));

      experience.forEach((exp) => {
        documentChildren.push(
          new Table({
            width: { size: 10800, type: WidthType.DXA },
            borders: {
              top: { style: BorderStyle.NONE },
              bottom: { style: BorderStyle.NONE },
              left: { style: BorderStyle.NONE },
              right: { style: BorderStyle.NONE },
            },
            rows: [
              new TableRow({
                cantSplit: true,
                children: [
                  new TableCell({
                    width: { size: 7560, type: WidthType.DXA },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: exp.company,
                            bold: true,
                            size: 20,
                            font: headingFont,
                            color: primaryColor,
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: { size: 3240, type: WidthType.DXA },
                    children: [
                      new Paragraph({
                        alignment: AlignmentType.RIGHT,
                        children: [
                          new TextRun({
                            text: exp.period,
                            bold: true,
                            size: 18,
                            font: headingFont,
                            color: primaryColor,
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
              new TableRow({
                cantSplit: true,
                children: [
                  new TableCell({
                    width: { size: 7560, type: WidthType.DXA },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: exp.position,
                            italics: true,
                            size: 19,
                            font: bodyFont,
                            color: primaryColor,
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: { size: 3240, type: WidthType.DXA },
                    children: [
                      new Paragraph({
                        alignment: AlignmentType.RIGHT,
                        children: [
                          new TextRun({
                            text: exp.location,
                            italics: true,
                            size: 18,
                            font: bodyFont,
                            color: primaryColor,
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),
          new Paragraph({ spacing: { after: 40 } }),
          ...exp.description.map(
            (bullet) =>
              new Paragraph({
                bullet: { level: 0 },
                spacing: { after: 40 },
                alignment: AlignmentType.JUSTIFIED,
                children: [
                  new TextRun({
                    text: bullet,
                    size: 20,
                    font: bodyFont,
                    color: primaryColor,
                  }),
                ],
              })
          ),
          new Paragraph({ spacing: { after: 120 } })
        );
      });
    }

    // Education
    if (education.length > 0) {
      documentChildren.push(addOriginalHeading('Education'));

      education.forEach((edu) => {
        documentChildren.push(
          new Table({
            width: { size: 10800, type: WidthType.DXA },
            borders: {
              top: { style: BorderStyle.NONE },
              bottom: { style: BorderStyle.NONE },
              left: { style: BorderStyle.NONE },
              right: { style: BorderStyle.NONE },
            },
            rows: [
              new TableRow({
                cantSplit: true,
                children: [
                  new TableCell({
                    width: { size: 7560, type: WidthType.DXA },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: edu.institution,
                            bold: true,
                            size: 20,
                            font: headingFont,
                            color: primaryColor,
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: { size: 3240, type: WidthType.DXA },
                    children: [
                      new Paragraph({
                        alignment: AlignmentType.RIGHT,
                        children: [
                          new TextRun({
                            text: edu.period,
                            bold: true,
                            size: 18,
                            font: headingFont,
                            color: primaryColor,
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),
          new Paragraph({
            spacing: { before: 20, after: 100 },
            children: [
              new TextRun({
                text: `${edu.degree} in ${edu.fieldOfStudy}`,
                italics: true,
                size: 19,
                font: bodyFont,
                color: primaryColor,
              }),
            ],
          })
        );
      });
    }

    // Skills
    if (skills.length > 0) {
      documentChildren.push(addOriginalHeading('Skills'));
      const originalSkills = skills.map((s) => s.name).join(', ');
      documentChildren.push(
        new Paragraph({
          spacing: { before: 40, after: 100 },
          children: [
            new TextRun({
              text: originalSkills,
              size: 20,
              font: bodyFont,
              color: primaryColor,
            }),
          ],
        })
      );
    }
  }

  // Create the final Document instance
  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: topMargin,
              bottom: bottomMargin,
              left: leftMargin,
              right: rightMargin,
            },
          },
        },
        children: documentChildren,
      },
    ],
  });

  return await Packer.toBlob(doc);
}
