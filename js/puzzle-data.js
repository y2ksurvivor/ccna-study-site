// ─────────────────────────────────────────────────────────────────────────────
//  CCNA Command Puzzle — Generated from Flackbox CCNA 200-301 Anki Deck
//  66 puzzles organized by section number
//  Modes: exec | config | config-if | config-router | config-line | dhcp-config
//         switch-config | switch-config-if | switch-config-if-range
// ─────────────────────────────────────────────────────────────────────────────

const PUZZLES = [
  // ── Section 4: IOS Basics ──────────────────────────
  { id: 1, section: 4, unit: 'Section 4 – IOS Basics', scenario: 'This command makes the running configuration persistent across reboot.', answer: 'copy running-config startup-config', hint: 'Starts with \'copy running-config\' — 3 words.', mode: 'exec' },
  { id: 2, section: 4, unit: 'Section 4 – IOS Basics', scenario: 'The show command that displays the entire running configuration on the router.', answer: 'show running-config', hint: 'Starts with \'show running-config\' — 2 words.', mode: 'exec' },
  // ── Section 12: DNS ──────────────────────────
  { id: 3, section: 12, unit: 'Section 12 – DNS', scenario: 'What command is entered on a router to enable DNS hostname resolution?', answer: 'ip domain-lookup', hint: 'Starts with \'ip domain-lookup\' — 2 words.', mode: 'config' },
  { id: 4, section: 12, unit: 'Section 12 – DNS', scenario: 'What command configures a primary domain name of \'flackbox.com\' on a router?', answer: 'ip domain-name flackbox.com', hint: 'Starts with \'ip domain-name\' — 3 words.', mode: 'config' },
  { id: 5, section: 12, unit: 'Section 12 – DNS', scenario: 'What command is entered on a router for it to act as a DNS server?', answer: 'ip dns server', hint: 'Starts with \'ip dns\' — 3 words.', mode: 'config' },
  { id: 6, section: 12, unit: 'Section 12 – DNS', scenario: 'What command is entered on the DNS-Client to allow it to send DNS queries to a DNS server at 172.16.1.1?', answer: 'ip name-server 172.16.1.1', hint: 'Starts with \'ip name-server\' — 3 words.', mode: 'config' },
  // ── Section 14: Interfaces ──────────────────────────
  { id: 7, section: 14, unit: 'Section 14 – Interfaces', scenario: 'What command configures the IP address 10.128.254.254/30 on an interface?', answer: 'ip address 10.128.254.254 255.255.255.252', hint: 'Starts with \'ip address\' — 4 words.', mode: 'config-if' },
  { id: 8, section: 14, unit: 'Section 14 – Interfaces', scenario: 'This command configures the default gateway on Layer 2 switches.', answer: 'ip default-gateway', hint: 'Starts with \'ip default-gateway\' — 2 words.', mode: 'switch-config' },
  { id: 9, section: 14, unit: 'Section 14 – Interfaces', scenario: 'What command sets an interface to full duplex?', answer: 'duplex full', hint: 'Starts with \'duplex full\' — 2 words.', mode: 'config-if' },
  { id: 10, section: 14, unit: 'Section 14 – Interfaces', scenario: 'What command configures a speed of 100 Mbps on an interface?', answer: 'speed 100', hint: 'Starts with \'speed 100\' — 2 words.', mode: 'config-if' },
  { id: 11, section: 14, unit: 'Section 14 – Interfaces', scenario: 'What command shows the IOS version running on the device and memory information?', answer: 'show version', hint: 'Starts with \'show version\' — 2 words.', mode: 'exec' },
  { id: 12, section: 14, unit: 'Section 14 – Interfaces', scenario: 'To disable CDP at the interface level, this command is used.', answer: 'no cdp enable', hint: 'Starts with \'no cdp\' — 3 words.', mode: 'config-if' },
  // ── Section 15: IOS File Mgmt ──────────────────────────
  { id: 13, section: 15, unit: 'Section 15 – IOS File Mgmt', scenario: 'What command copies the running configuration to a TFTP server?', answer: 'copy running-config tftp', hint: 'Starts with \'copy running-config\' — 3 words.', mode: 'exec' },
  { id: 14, section: 15, unit: 'Section 15 – IOS File Mgmt', scenario: 'This command copies an IOS image to the device\'s Flash using TFTP.', answer: 'copy tftp flash', hint: 'Starts with \'copy tftp\' — 3 words.', mode: 'exec' },
  // ── Section 16: Static Routing ──────────────────────────
  { id: 15, section: 16, unit: 'Section 16 – Static Routing', scenario: 'What show command displays the routing table on a router?', answer: 'show ip route', hint: 'Starts with \'show ip\' — 3 words.', mode: 'exec' },
  { id: 16, section: 16, unit: 'Section 16 – Static Routing', scenario: 'Configure a static route to 172.16.0.0/16 with next hop 172.17.1.1.', answer: 'ip route 172.16.0.0 255.255.0.0 172.17.1.1', hint: 'Starts with \'ip route\' — 5 words.', mode: 'config' },
  // ── Section 19: EIGRP ──────────────────────────
  { id: 17, section: 19, unit: 'Section 19 – EIGRP', scenario: 'What command disables automatic summarization in EIGRP?', answer: 'no auto-summary', hint: 'Starts with \'no auto-summary\' — 2 words.', mode: 'config-router' },
  { id: 18, section: 19, unit: 'Section 19 – EIGRP', scenario: 'This show command verifies EIGRP neighbor adjacency.', answer: 'show ip eigrp neighbors', hint: 'Starts with \'show ip\' — 4 words.', mode: 'exec' },
  // ── Section 20: OSPF ──────────────────────────
  { id: 19, section: 20, unit: 'Section 20 – OSPF', scenario: 'What command manually sets an OSPF cost value of 15 on an interface?', answer: 'ip ospf cost 15', hint: 'Starts with \'ip ospf\' — 4 words.', mode: 'config-if' },
  // ── Section 21: VLANs & Trunking ──────────────────────────
  { id: 20, section: 21, unit: 'Section 21 – VLANs & Trunking', scenario: 'What command disables DTP on an interface?', answer: 'switchport nonegotiate', hint: 'Starts with \'switchport nonegotiate\' — 2 words.', mode: 'switch-config-if' },
  { id: 21, section: 21, unit: 'Section 21 – VLANs & Trunking', scenario: 'What command configures an interface as a dynamic desirable trunk port?', answer: 'switchport mode dynamic desirable', hint: 'Starts with \'switchport mode\' — 4 words.', mode: 'switch-config-if' },
  { id: 22, section: 21, unit: 'Section 21 – VLANs & Trunking', scenario: 'What command configures an interface as an access port?', answer: 'switchport mode access', hint: 'Starts with \'switchport mode\' — 3 words.', mode: 'switch-config-if' },
  { id: 23, section: 21, unit: 'Section 21 – VLANs & Trunking', scenario: 'What command adds VLAN 10 to the allowed list on a trunk port?', answer: 'switchport trunk allowed vlan add 10', hint: 'Starts with \'switchport trunk\' — 6 words.', mode: 'switch-config-if' },
  // ── Section 22: Inter-VLAN Routing ──────────────────────────
  { id: 24, section: 22, unit: 'Section 22 – Inter-VLAN Routing', scenario: 'What command creates sub-interface 15 on Fast Ethernet 0/5?', answer: 'interface fastethernet 0/5.15', hint: 'Starts with \'interface fastethernet\' — 3 words.', mode: 'config' },
  { id: 25, section: 22, unit: 'Section 22 – Inter-VLAN Routing', scenario: 'This command enables IP routing on a Layer 3 switch.', answer: 'ip routing', hint: 'Starts with \'ip routing\' — 2 words.', mode: 'switch-config' },
  { id: 26, section: 22, unit: 'Section 22 – Inter-VLAN Routing', scenario: 'This command allows a Layer 3 switch physical interface to act as a routed port.', answer: 'no switchport', hint: 'Starts with \'no switchport\' — 2 words.', mode: 'switch-config-if' },
  // ── Section 23: DHCP ──────────────────────────
  { id: 27, section: 23, unit: 'Section 23 – DHCP', scenario: 'What show command displays information about the DHCP lease on a client?', answer: 'show dhcp lease', hint: 'Starts with \'show dhcp\' — 3 words.', mode: 'exec' },
  { id: 28, section: 23, unit: 'Section 23 – DHCP', scenario: 'What command configures a Cisco router interface as a DHCP client?', answer: 'ip address dhcp', hint: 'Starts with \'ip address\' — 3 words.', mode: 'config-if' },
  { id: 29, section: 23, unit: 'Section 23 – DHCP', scenario: 'What command forwards DHCP requests to an external server at 172.100.10.1?', answer: 'ip helper-address 172.100.10.1', hint: 'Starts with \'ip helper-address\' — 3 words.', mode: 'config-if' },
  { id: 30, section: 23, unit: 'Section 23 – DHCP', scenario: 'What command creates a DHCP pool named \'flackbox\'?', answer: 'ip dhcp pool flackbox', hint: 'Starts with \'ip dhcp\' — 4 words.', mode: 'config' },
  { id: 31, section: 23, unit: 'Section 23 – DHCP', scenario: 'This show command displays addresses leased by the DHCP server and who received them.', answer: 'show ip dhcp binding', hint: 'Starts with \'show ip\' — 4 words.', mode: 'exec' },
  { id: 32, section: 23, unit: 'Section 23 – DHCP', scenario: 'Configure the DHCP server to allocate addresses from 172.16.1.0/24.', answer: 'network 172.16.1.0 255.255.255.0', hint: 'Starts with \'network 172.16.1.0\' — 3 words.', mode: 'dhcp-config' },
  { id: 33, section: 23, unit: 'Section 23 – DHCP', scenario: 'What command excludes address range 10.0.0.1 to 10.0.0.10 from the DHCP pool?', answer: 'ip dhcp excluded-address 10.0.0.1 10.0.0.10', hint: 'Starts with \'ip dhcp\' — 5 words.', mode: 'config' },
  // ── Section 24: HSRP / FHRP ──────────────────────────
  { id: 34, section: 24, unit: 'Section 24 – HSRP / FHRP', scenario: 'This show command displays the HSRP virtual IP, state, and virtual MAC address.', answer: 'show standby', hint: 'Starts with \'show standby\' — 2 words.', mode: 'exec' },
  { id: 35, section: 24, unit: 'Section 24 – HSRP / FHRP', scenario: 'Configure a virtual IP of 172.16.1.1 for HSRP group 1.', answer: 'standby 1 ip 172.16.1.1', hint: 'Starts with \'standby 1\' — 4 words.', mode: 'config-if' },
  { id: 36, section: 24, unit: 'Section 24 – HSRP / FHRP', scenario: 'Configure a priority of 50 on HSRP group 10.', answer: 'standby 10 priority 50', hint: 'Starts with \'standby 10\' — 4 words.', mode: 'config-if' },
  { id: 37, section: 24, unit: 'Section 24 – HSRP / FHRP', scenario: 'Enable pre-emption on HSRP group 10.', answer: 'standby 10 preempt', hint: 'Starts with \'standby 10\' — 3 words.', mode: 'config-if' },
  // ── Section 25: Spanning Tree ──────────────────────────
  { id: 38, section: 25, unit: 'Section 25 – Spanning Tree', scenario: 'What command enables PortFast on all access ports globally?', answer: 'spanning-tree portfast default', hint: 'Starts with \'spanning-tree portfast\' — 3 words.', mode: 'switch-config' },
  { id: 39, section: 25, unit: 'Section 25 – Spanning Tree', scenario: 'What command enables BPDU Guard on an interface?', answer: 'spanning-tree bpduguard enable', hint: 'Starts with \'spanning-tree bpduguard\' — 3 words.', mode: 'switch-config-if' },
  { id: 40, section: 25, unit: 'Section 25 – Spanning Tree', scenario: 'What command configures Root Guard on an interface?', answer: 'spanning-tree guard root', hint: 'Starts with \'spanning-tree guard\' — 3 words.', mode: 'switch-config-if' },
  { id: 41, section: 25, unit: 'Section 25 – Spanning Tree', scenario: 'What command makes a switch the Root Bridge for VLAN 10?', answer: 'spanning-tree vlan 10 root primary', hint: 'Starts with \'spanning-tree vlan\' — 5 words.', mode: 'switch-config' },
  // ── Section 26: EtherChannel ──────────────────────────
  { id: 42, section: 26, unit: 'Section 26 – EtherChannel', scenario: 'Create an LACP port-channel 10 in Active mode.', answer: 'channel-group 10 mode active', hint: 'Starts with \'channel-group 10\' — 4 words.', mode: 'switch-config-if-range' },
  { id: 43, section: 26, unit: 'Section 26 – EtherChannel', scenario: 'Create a PAgP port-channel 5 in Desirable mode.', answer: 'channel-group 5 mode desirable', hint: 'Starts with \'channel-group 5\' — 4 words.', mode: 'switch-config-if-range' },
  // ── Section 27: Switch Security ──────────────────────────
  { id: 44, section: 27, unit: 'Section 27 – Switch Security', scenario: 'Enable DHCP snooping on VLAN 20.', answer: 'ip dhcp snooping vlan 20', hint: 'Starts with \'ip dhcp\' — 5 words.', mode: 'switch-config' },
  { id: 45, section: 27, unit: 'Section 27 – Switch Security', scenario: 'Mark an interface as a DHCP snooping trusted port.', answer: 'ip dhcp snooping trust', hint: 'Starts with \'ip dhcp\' — 4 words.', mode: 'switch-config-if' },
  { id: 46, section: 27, unit: 'Section 27 – Switch Security', scenario: 'Enable Dynamic ARP Inspection (DAI) on VLAN 100.', answer: 'ip arp inspection vlan 100', hint: 'Starts with \'ip arp\' — 5 words.', mode: 'switch-config' },
  { id: 47, section: 27, unit: 'Section 27 – Switch Security', scenario: 'This show command verifies port security MAC address entries.', answer: 'show port-security address', hint: 'Starts with \'show port-security\' — 3 words.', mode: 'exec' },
  { id: 48, section: 27, unit: 'Section 27 – Switch Security', scenario: 'Set the maximum number of allowed MAC addresses on an interface to 5.', answer: 'switchport port-security maximum 5', hint: 'Starts with \'switchport port-security\' — 4 words.', mode: 'switch-config-if' },
  // ── Section 28: ACLs ──────────────────────────
  { id: 49, section: 28, unit: 'Section 28 – ACLs', scenario: 'This command applies an ACL to an interface.', answer: 'ip access-group', hint: 'Starts with \'ip access-group\' — 2 words.', mode: 'config-if' },
  { id: 50, section: 28, unit: 'Section 28 – ACLs', scenario: 'Configure standard ACL 10 to permit traffic from 192.168.10.0/24.', answer: 'access-list 10 permit 192.168.10.0 0.0.0.255', hint: 'Starts with \'access-list 10\' — 5 words.', mode: 'config' },
  { id: 51, section: 28, unit: 'Section 28 – ACLs', scenario: 'Configure standard ACL 1 to permit all traffic.', answer: 'access-list 1 permit any', hint: 'Starts with \'access-list 1\' — 4 words.', mode: 'config' },
  { id: 52, section: 28, unit: 'Section 28 – ACLs', scenario: 'Create a named extended ACL called \'FlackboxACL\'.', answer: 'ip access-list extended flackboxacl', hint: 'Starts with \'ip access-list\' — 4 words.', mode: 'config' },
  // ── Section 29: NAT ──────────────────────────
  { id: 53, section: 29, unit: 'Section 29 – NAT', scenario: 'Create a NAT pool named \'FlackboxNAT\' with global addresses 100.1.2.3–100.1.2.10 and a /27 mask.', answer: 'ip nat pool flackboxnat 100.1.2.3 100.1.2.10 netmask 255.255.255.224', hint: 'Starts with \'ip nat\' — 8 words.', mode: 'config' },
  { id: 54, section: 29, unit: 'Section 29 – NAT', scenario: 'This show command displays inside global, inside local, outside local, and outside global NAT translations.', answer: 'show ip nat translations', hint: 'Starts with \'show ip\' — 4 words.', mode: 'exec' },
  { id: 55, section: 29, unit: 'Section 29 – NAT', scenario: 'This show command displays how many addresses have been translated by NAT.', answer: 'show ip nat statistics', hint: 'Starts with \'show ip\' — 4 words.', mode: 'exec' },
  // ── Section 30: IPv6 ──────────────────────────
  { id: 56, section: 30, unit: 'Section 30 – IPv6', scenario: 'What command enables IPv6 unicast routing on a router?', answer: 'ipv6 unicast-routing', hint: 'Starts with \'ipv6 unicast-routing\' — 2 words.', mode: 'config' },
  { id: 57, section: 30, unit: 'Section 30 – IPv6', scenario: 'What command assigns the IPv6 address 2001:db8:1::1/64 to an interface?', answer: 'ipv6 address 2001:db8:1::1/64', hint: 'Starts with \'ipv6 address\' — 3 words.', mode: 'config-if' },
  // ── Section 33: Device Security ──────────────────────────
  { id: 58, section: 33, unit: 'Section 33 – Device Security', scenario: 'This command generates an RSA key pair for SSH.', answer: 'crypto key generate rsa', hint: 'Starts with \'crypto key\' — 4 words.', mode: 'config' },
  { id: 59, section: 33, unit: 'Section 33 – Device Security', scenario: 'This command sets the enable secret password.', answer: 'enable secret', hint: 'Starts with \'enable secret\' — 2 words.', mode: 'config' },
  { id: 60, section: 33, unit: 'Section 33 – Device Security', scenario: 'This command encrypts all plaintext passwords in the running configuration.', answer: 'service password-encryption', hint: 'Starts with \'service password-encryption\' — 2 words.', mode: 'config' },
  { id: 61, section: 33, unit: 'Section 33 – Device Security', scenario: 'What command configures a login banner shown before users log in?', answer: 'banner login', hint: 'Starts with \'banner login\' — 2 words.', mode: 'config' },
  { id: 62, section: 33, unit: 'Section 33 – Device Security', scenario: 'This command configures a router as an NTP master (stratum 1) server.', answer: 'ntp master', hint: 'Starts with \'ntp master\' — 2 words.', mode: 'config' },
  { id: 63, section: 33, unit: 'Section 33 – Device Security', scenario: 'This command configures the router to synchronize its clock with NTP server 172.16.1.1.', answer: 'ntp server 172.16.1.1', hint: 'Starts with \'ntp server\' — 3 words.', mode: 'config' },
  // ── Section 34: Logging & SNMP ──────────────────────────
  { id: 64, section: 34, unit: 'Section 34 – Logging & SNMP', scenario: 'This command disables syslog messages from being sent to the console line.', answer: 'no logging console', hint: 'Starts with \'no logging\' — 3 words.', mode: 'config' },
  { id: 65, section: 34, unit: 'Section 34 – Logging & SNMP', scenario: 'This command causes the CLI prompt to reappear below any syslog messages so typing is not interrupted.', answer: 'logging synchronous', hint: 'Starts with \'logging synchronous\' — 2 words.', mode: 'config-line' },
  { id: 66, section: 34, unit: 'Section 34 – Logging & SNMP', scenario: 'What command configures the syslog server at 172.16.1.1?', answer: 'logging 172.16.1.1', hint: 'Starts with \'logging 172.16.1.1\' — 2 words.', mode: 'config' },
];
