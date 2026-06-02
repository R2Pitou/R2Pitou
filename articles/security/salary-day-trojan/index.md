---
layout: article
title: "The Salary Day Trojan: Responding to an Active Telegram Malware Outbreak Across Five Campuses"
date: 2026-06-02 09:00:00 +0700
featured: true
summary: "A human-centric operational postmortem of a multi-campus incident response effort, pivoting from rapid technical analysis to supporting parents, students, and staff until 1:00 AM."
tags:
  - security
  - incident-response
  - malware
  - telegram
  - governance
image: /articles/security/salary-day-trojan/hero.png
image_alt: "VirusTotal Graph illustrating file connections and behaviors of the Salary Day Trojan"
permalink: /security/salary-day-trojan/
---

On November 25, 2025, an active malware outbreak disrupted our multi-campus educational environment. Within a three-minute window, the event escalated from a single suspicious file receipt to a coordinated, multi-campus alert. However, as the evening unfolded, the technical challenge of analyzing code was quickly overshadowed by a far larger task: managing human panic, coordinating recovery across five campuses, and supporting parents, students, and staff late into the night. 

This postmortem documents the timeline, technical findings, and—most importantly—the human side of incident response.

---

## 1. Why This Incident Mattered

A compromised workstation or a random malware infection is a routine IT problem, managed with standard isolation and recovery procedures. This incident was different because it targeted our organizational trust.

The outbreak began when a compromised Telegram account belonging to one of our campuses—a channel specifically designated for parent communication—began distributing a malicious executable file named **"Lương tháng 11 + hoa hồng.exe"** (translated from Vietnamese: *November Salary + Commission.exe*).

Because the file appeared to originate from a trusted, official channel, parents, staff, and students had every reason to believe it was a legitimate communication. In any community, when a primary communication line is subverted, a technical vulnerability immediately becomes an organizational trust crisis. 

---

## 2. Initial Detection & Rapid Verification

Speed is the primary factor in containing propagation. Our response timeline moved from initial detection to active triage and formal broadcast:

*   **16:47 | Threat Discovery**: I noticed the suspicious `.exe` file distributed in a Telegram communication group. Recognizing that salary sheets are never distributed as Windows executable files, I immediately flagged the threat.
*   **16:48 | Technical Triage**: The file’s cryptographic hash was extracted and submitted to VirusTotal for analysis. The hash returned immediate positive detections for malicious characteristics.
*   **16:50 | Mitigation Initiated**: Within three minutes of the file being received, we began active mitigation steps—tracing the compromised account's active sessions, identifying the target host, and drafting warning advisories.
*   **17:08 | Bilingual Alert Broadcasted**: The first formal, bilingual warning was broadcasted to all staff, students, and parent communication channels.

### The Emergency Broadcast

The alert was sent verbatim in both Khmer and English to ensure immediate visibility across all user demographics:

> **[25/11/2025 17:08] Arttu Pitou At 🇰🇭អាតពិទូ:**  
> Please check TTP Computers.  
>   
> ⚠️⚠️⚠️ ការជូនដំណឹងបន្ទាន់ពីផ្នែក IT៖ មេរោគកំពុងរីករាលដាល (Urgent Security Alert from IT) សូមប្រុងប្រយ័ត្ន!  
> បច្ចុប្បន្នមានគណនីមួយចំនួនកំពុងបញ្ជូនឯកសារដែលមានផ្ទុកមេរោគ (Trojan) ចូលក្នុងគ្រុបការងារ និងការសន្ទនាឯកជន។  
>   
> **សញ្ញាសម្គាល់៖**  
> *   ឈ្មោះឯកសារ៖ `"Lương tháng 11 + hoa hồng.exe"` (ឈ្មោះជាភាសាវៀតណាម)  
> *   ប្រភេទឯកសារ៖ វាជាឯកសារ `.exe` (កម្មវិធី) មិនមែនជាឯកសារ Word ឬ PDF ទេ  
>   
> **ចំណាត់ការបន្ទាន់៖**  
> 🚫 **ហាមចុចបើក ឬទាញយក (Download) ជាដាច់ខាត**។ ឯកសារនេះត្រូវបានរកឃើញថាជាមេរោគ (Malware/Trojan) ដែលអាចលួចទិន្នន័យ ឬបំផ្លាញកុំព្យូទ័ររបស់អ្នក។  
> 🗑 ប្រសិនបើអ្នកទទួលបានសារនេះ សូមលុបវាចោលភ្លាមៗ។  
>   
> 🚨 **ប្រសិនបើអ្នកបានច្រឡំចុចបើកឯកសារនេះ៖**  
> 1. **ផ្តាច់អ៊ីនធឺណិតភ្លាមៗ**៖ បិទ Wi-Fi ឬដកខ្សែ LAN ចេញពីកុំព្យូទ័ររបស់អ្នកជាបន្ទាន់។  
> 2. **ទាក់ទងមកខ្ញុំជាបន្ទាន់**៖ សូមឆាតមកខ្ញុំតាមរយៈតំណភ្ជាប់នេះ ដើម្បីឱ្យខ្ញុំជួយដោះស្រាយ 👉 https://t.me/atpitou  
> 3. **ប្តូរពាក្យសម្ងាត់ (Passwords)**៖ ប្រើប្រាស់ទូរស័ព្ទដៃដើម្បីប្តូរលេខសម្ងាត់ Telegram និង Email របស់អ្នក (ហាមប្តូរនៅលើកុំព្យូទ័រដែលឆ្លងមេរោគ)។  
>   
> ***  
>   
> ⚠️ **URGENT IT SECURITY ALERT: Trojan Virus Circulating**  
> Please be extremely careful. There is a malicious file currently being forwarded in Telegram groups and private chats.  
>   
> **How to identify it:**  
> *   Filename: `"Lương tháng 11 + hoa hồng.exe"`  
> *   File Type: Note that it ends in `.exe`. This is an executable program, NOT a document.  
>   
> **What you must do:**  
> 🚫 **DO NOT CLICK, OPEN, or DOWNLOAD this file**. Security scans confirm this is a Trojan/Malware. Opening it will infect your computer and compromise your data.  
> 🗑 If you see this message, delete it immediately.  
>   
> 🚨 **IF YOU ACCIDENTALLY OPENED THE FILE:**  
> 1. **Disconnect from the Internet IMMEDIATELY**: Turn off Wi-Fi or unplug your Ethernet cable.  
> 2. **Contact IT Support Immediately**: Message me directly at this link for assistance 👉 https://t.me/atpitou  
> 3. **Change Your Passwords**: Using your PHONE (not the computer), change your Telegram and Email passwords immediately.

This rapid reaction window prevented widespread, automated execution on workstations across our offices. However, the virus had already begun its second phase: session hijacking.

![Initial Telegram distribution showing the malicious payload sent from a trusted parent communication channel](/articles/security/salary-day-trojan/telegram-outbreak.png)

*Figure 1: The malicious payload "Lương tháng 11 + hoa hồng.exe" as distributed via a hijacked campus Telegram account.*

---

## 3. Understanding the Threat Vector

Standard security training teaches users to watch for external email addresses, lookalike domains, and generic greetings. This campaign bypassed those filters by exploiting trusted relationships.

When the malware is executed on a Windows machine, it gains access to active Telegram session data. It then hijacks the user's account to automatically forward the malicious executable to their recent contacts, active conversations, and work groups. 

Because recipients received the file from colleagues, friends, and school administrative accounts, their default suspicion was lowered. Users did not click the file out of foolishness; they clicked it because they trusted the sender. This highlighted a key operational truth: **trust is the most exploitable vector in modern organizational security.**

---

## 4. Operational Response & Triage Under Uncertainty

Coordinating a response across five distinct campuses, each with its own local staff and user populations, required immediate centralization. We established a central command channel to coordinate triage, but we quickly realized that technical logs did not match the reality of user reports.

In incident response theory, systems report clean status codes. In practice, users do not report "I executed a Trojan." They report: *"Something weird happened to my Telegram,"* or *"My account is sending messages by itself, but I didn't write them."*

We had to establish a rapid diagnostic workflow to triage users under intense uncertainty. We systematically asked:

1.  **Did you download the file?**
2.  **On what device did you open it?** (Windows PC, macOS, Android phone, or iPhone?)
3.  **Is your account currently sending messages automatically?**
4.  **Do you still have access to your account?**
5.  **Can you see your active sessions list?**

### Distinguishing Phone Exposure from PC Execution

A significant portion of the evening was spent performing device-specific triage. Because the malicious file was a Windows executable (`.exe`), it could not execute on mobile operating systems (iOS and Android) or macOS. 

Many panicked parents and staff reported opening the message on their mobile phones. We were able to reassure them that while they had viewed the message, their mobile devices were not infected by the executable. We instructed them to simply delete the message from their logs. 

For users who had downloaded and run the file on Windows PCs, we immediately coordinated device isolation, helping them disconnect from the network to prevent further lateral movement.

---

## 5. The Human Side of the Incident

Most technical postmortems focus on code blocks and Indicators of Compromise (IOCs). However, by 19:00, our technical investigation had shifted entirely into a high-intensity support operation. 

This was no longer a malware analysis problem; it was a human crisis. 

*   **Frightened People**: Parents contacted the IT department directly, anxious about their children's data and family privacy.
*   **Anxious Students**: Students worried they had broken school devices or would face disciplinary action for clicking a link.
*   **Guilt-Ridden Staff**: Teachers and administrative staff were deeply concerned that their hijacked accounts were responsible for spreading the infection to their colleagues.

Our team treated every user with empathy. Many users made reasonable decisions based on the context they had at the time. Portraying them as careless would only discourage future transparent reporting. 

We set up an informal emergency support desk, translating complex recovery steps into plain Khmer and English. We repeated the same instructions—how to check active Telegram sessions, how to terminate unauthorized devices, and how to set up two-step verification—dozens of times. 

We remained online, answering individual messages and guiding users through account recovery, until approximately 1:00 AM.

---

## 6. Technical Investigation (Observations)

A sandbox review of the file `Lương tháng 11 + hoa hồng.exe` (SHA256: `6f43a429cd634a1a42a77909b512ec533b7f04da5172178939565de22bf40462`) revealed a series of system modifications and process relationships. 

### Sandbox Observations

Based on sandbox execution reports (CAPE/Zenbox), we observed the following technical characteristics upon execution:

*   **Process Spawning & Shell Manipulation**:
    *   The executable ran command-line instructions using a batch script:
        `cmd.exe /C ""C:\windows\MxgcIiXsde.bat""`
    *   It initiated process enumeration and searches via `tasklist /fi "PID eq 6684"` and `findstr`.
*   **Library Dropping & DLL Execution**:
    *   The program dropped several files into temporary directories, including `nsis_tauri_utils.dll`, `System.dll`, and a driver named `llama.sys`.
    *   It placed a payload DLL named `goldendays.dll` under `C:\ProgramData\Roning\` and executed it silently via:
        `regsvr32.exe /S "C:\ProgramData\Roning\goldendays.dll"`
    *   It created a directory under `C:\Users\Public\Downloads\20251125115015\` containing multiple files: `1.bat`, `fhq.bat`, `hjk.txt`, `agg.txt`, `kill.txt`, and `1.dll`.
*   **System Service Registration**:
    *   The malware registered and started a system service named `llama` pointing to the dropped driver (`llama.sys`).
    *   It registered a service named `MicrosoftSoftware2ShadowCop4yProvider` to establish persistence.
*   **Network Activity**:
    *   The system recorded attempt connections to a dead IP and local listening ports.
    *   Connections to external hosts were initiated for data egress and payload delivery.

The relationships and file dependencies are visualized in the interactive VirusTotal Graph below:

<iframe
  src="https://www.virustotal.com/graph/embed/g3267f71508ed4d83988c1655fdd833e42b093c72427d4dc79f4f4dd9fc51ef6c?theme=dark"
  width="100%"
  height="400"
  style="border: 1px solid var(--line); border-radius: 8px; margin: 20px 0;">
</iframe>

Detailed detection metrics and scanner signatures are documented on the [VirusTotal Hash Page](https://www.virustotal.com/gui/file/6f43a429cd634a1a42a77909b512ec533b7f04da5172178939565de22bf40462/detection).

---

## 7. Recovery & Containment Guidance

To halt the propagation cycle and secure compromised accounts, we distributed a clear, sequential recovery checklist in both Khmer and English:

1.  **Terminate Active Sessions**: Open Telegram, navigate to *Settings > Devices*, and select **Terminate all other sessions** to force the attacker off the hijacked account.
2.  **Enable Two-Step Verification (2FA)**: Set up a secondary password in Telegram (*Settings > Privacy and Security > Two-Step Verification*). This ensures that even if a session is hijacked in the future, the account cannot be accessed without the master password.
3.  **Delete Malicious Messages**: Remove the forwarded malware file from chat logs and groups to prevent other users from clicking it.
4.  **Isolate Affected Workstations**: Disconnect infected Windows PCs from the local network immediately to prevent lateral propagation.
5.  **Change Credentials**: Reset passwords for all sensitive organizational systems, performing the changes from a trusted, clean device.

*Note: During containment discussions, our team recommended blocking identified malicious infrastructure at the gateway level to limit the outbreak's spread.*

---

## 8. Lessons Learned

Every active security incident offers critical lessons for future resilience:

*   **Trusted Contacts Bypass Training**: Traditional phishing awareness is insufficient when threats originate from compromised, authenticated accounts belonging to friends or colleagues. Containment depends on verification speed.
*   **Speed Over Perfection**: During an active outbreak, broadcasting a clear, timely warning is more valuable than waiting to compile a complete technical analysis.
*   **Bilingual Emergency Response**: In multi-cultural organizations, security alerts and recovery checklists must be published in both native and international languages (Khmer and English) simultaneously to prevent communication lag.
*   **User Support is the Real Work**: Analyzing malware behavior takes minutes; supporting hundreds of anxious people, walking them through recovery, and restoring organizational trust takes hours of focused, empathetic labor.
*   **Clear Instructions Prevent Panic**: Plain, numbered lists of recovery steps keep users focused on action rather than fear.

---

## 9. Reflections

The hardest part of this incident was not extracting file hashes or reviewing sandbox execution paths. The hardest part was staying online until 1:00 AM, translating technical instructions, and providing a calm, reassuring voice to parents, students, and staff while the situation was still active.

Practical incident response is not a laboratory exercise. It is a combination of rapid technical investigation, clear communication, cross-campus coordination, and hands-on user recovery. Ultimately, security operations are not just about protecting machines—they are about supporting the people who use them.

***

**Operational Links & Artifacts:**
*   [Original Bilingual Security Alert (Telegra.ph)](https://telegra.ph/%E1%9E%9C%E1%9E%92%E1%9E%93%E1%9E%80%E1%9E%9A%E1%9E%80%E1%9E%9A%E1%9E%96%E1%9E%9A%E1%9E%82--Security-Alert-How-to-handle-the-Salary-Trojan-Virus-11-25)
*   [VirusTotal Analysis Directory](https://www.virustotal.com/gui/file/6f43a429cd634a1a42a77909b512ec533b7f04da5172178939565de22bf40462/detection)
