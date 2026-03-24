// ─────────────────────────────────────────────────────────────────────────────
//  CCNA Command Puzzle — Question Bank
//  Each entry: { id, scenario, answer, hint, mode, category }
//  mode: 'exec' = Router#    'config' = Router(config)#
// ─────────────────────────────────────────────────────────────────────────────

const PUZZLES = [

  // ── Interfaces ──────────────────────────────────────────────────────────────
  {
    id: 1,
    scenario: "A network engineer needs a quick one-line summary of every interface on a router, including IP address, status, and line protocol. Which single command provides this output?",
    answer: "show ip interface brief",
    hint: "Starts with 'show ip' — gives a table, not detailed stats.",
    mode: "exec",
    category: "interface",
  },
  {
    id: 2,
    scenario: "You issue a 'show interfaces GigabitEthernet0/0' and see 'GigabitEthernet0/0 is administratively down'. Which command, entered in interface configuration mode, will bring this interface up?",
    answer: "no shutdown",
    hint: "It's the opposite of the command that disables an interface.",
    mode: "config",
    category: "interface",
  },
  {
    id: 3,
    scenario: "A technician needs to administratively disable a router interface to perform maintenance. Which command is entered in interface configuration mode?",
    answer: "shutdown",
    hint: "A single word — the command that places the interface in 'administratively down' state.",
    mode: "config",
    category: "interface",
  },

  // ── Routing ──────────────────────────────────────────────────────────────────
  {
    id: 4,
    scenario: "You need to view the complete IPv4 routing table on a Cisco router, including all route sources, next-hops, and administrative distances. Which command do you use?",
    answer: "show ip route",
    hint: "Three words. The most fundamental routing verification command on IOS.",
    mode: "exec",
    category: "routing",
  },
  {
    id: 5,
    scenario: "You want to filter the routing table to display only routes learned via OSPF. Which command shows only OSPF-learned prefixes?",
    answer: "show ip route ospf",
    hint: "'show ip route' followed by the routing protocol name.",
    mode: "exec",
    category: "routing",
  },
  {
    id: 6,
    scenario: "A technician needs to view all routing protocols currently running on the router along with their timers, networks, and redistributed sources. Which command is used?",
    answer: "show ip protocols",
    hint: "Two words after 'show ip'. Displays protocol parameters, not the routing table itself.",
    mode: "exec",
    category: "routing",
  },

  // ── OSPF ────────────────────────────────────────────────────────────────────
  {
    id: 7,
    scenario: "You are troubleshooting an OSPF topology and need to verify which neighbors have formed adjacencies, their current state, and the Dead timer countdown. Which command do you use?",
    answer: "show ip ospf neighbor",
    hint: "Four words. The primary OSPF adjacency verification command.",
    mode: "exec",
    category: "ospf",
  },
  {
    id: 8,
    scenario: "You need more detail on an OSPF neighbor relationship, including the neighbor's router ID, DR/BDR role, and full state transition history. Which command provides this?",
    answer: "show ip ospf neighbor detail",
    hint: "Same as the neighbor command, plus one more word at the end.",
    mode: "exec",
    category: "ospf",
  },
  {
    id: 9,
    scenario: "A network engineer needs to verify the OSPF process ID, router ID, SPF run count, and area assignments configured on a router. Which command is used?",
    answer: "show ip ospf",
    hint: "Just three words — no 'neighbor' or 'interface' at the end.",
    mode: "exec",
    category: "ospf",
  },
  {
    id: 10,
    scenario: "You need to enter OSPF router configuration mode to configure process 1 on a Cisco router. Which command do you type at the global configuration prompt?",
    answer: "router ospf 1",
    hint: "Three words: the keyword to enter a routing protocol, the protocol name, and the process ID.",
    mode: "config",
    category: "ospf",
  },
  {
    id: 11,
    scenario: "You want to enable real-time debugging output to observe OSPF hello packets and state change events as they occur. Which command enables this?",
    answer: "debug ip ospf events",
    hint: "Starts with 'debug', not 'show'. Four words total.",
    mode: "exec",
    category: "ospf",
  },

  // ── EIGRP ───────────────────────────────────────────────────────────────────
  {
    id: 12,
    scenario: "You are verifying that EIGRP has successfully established neighbor relationships on a router. Which command shows the EIGRP neighbor table?",
    answer: "show ip eigrp neighbors",
    hint: "Four words. The EIGRP equivalent of 'show ip ospf neighbor'.",
    mode: "exec",
    category: "eigrp",
  },

  // ── BGP ─────────────────────────────────────────────────────────────────────
  {
    id: 13,
    scenario: "A network engineer needs to verify BGP peer session states and how many prefixes are being received from each neighbor. Which command provides this summary?",
    answer: "show ip bgp summary",
    hint: "Four words. 'show ip bgp' followed by the word for a brief overview.",
    mode: "exec",
    category: "bgp",
  },

  // ── Switching / VLANs ───────────────────────────────────────────────────────
  {
    id: 14,
    scenario: "You need to view all VLANs configured on a Cisco switch along with the access ports assigned to each VLAN. Which command provides this in a compact table format?",
    answer: "show vlan brief",
    hint: "Three words. 'show vlan' plus the word for a short summary.",
    mode: "exec",
    category: "vlan",
  },
  {
    id: 15,
    scenario: "You need to see which switch interfaces are currently operating as 802.1Q trunks and which VLANs are allowed on each trunk. Which command is used?",
    answer: "show interfaces trunk",
    hint: "Three words. Shows only trunk interfaces, not all interfaces.",
    mode: "exec",
    category: "vlan",
  },
  {
    id: 16,
    scenario: "You are configuring a switch port and need to force it into 802.1Q trunk mode. Which command, entered in interface configuration mode, does this?",
    answer: "switchport mode trunk",
    hint: "Three words. 'switchport mode' followed by the mode name.",
    mode: "config",
    category: "vlan",
  },
  {
    id: 17,
    scenario: "You need to configure a switch interface as a non-trunking access port. Which interface-level command sets this mode?",
    answer: "switchport mode access",
    hint: "Three words. Same structure as the trunk command, different mode name.",
    mode: "config",
    category: "vlan",
  },
  {
    id: 18,
    scenario: "You want to disable DTP negotiation on a trunk port to prevent automatic trunk formation with a connected device. Which command is entered in interface configuration mode?",
    answer: "switchport nonegotiate",
    hint: "Two words. Disables DTP entirely on the interface.",
    mode: "config",
    category: "vlan",
  },

  // ── STP ─────────────────────────────────────────────────────────────────────
  {
    id: 19,
    scenario: "You need to view the Spanning Tree topology including the root bridge, port roles (Root, Designated, Alternate), and port states for all VLANs. Which command is used?",
    answer: "show spanning-tree",
    hint: "Three words. The primary STP verification command.",
    mode: "exec",
    category: "stp",
  },
  {
    id: 20,
    scenario: "You are configuring an access port connected to a workstation and want it to skip the STP listening and learning states for faster link-up. Which interface-level command enables this?",
    answer: "spanning-tree portfast",
    hint: "Two words. The STP feature specifically designed for end-device ports.",
    mode: "config",
    category: "stp",
  },

  // ── DHCP ────────────────────────────────────────────────────────────────────
  {
    id: 21,
    scenario: "You need to view the IP address leases that the router's DHCP server has assigned to clients, including MAC addresses and expiry times. Which command is used?",
    answer: "show ip dhcp binding",
    hint: "Four words. 'show ip dhcp' followed by the word for address-to-MAC mappings.",
    mode: "exec",
    category: "dhcp",
  },

  // ── NAT ─────────────────────────────────────────────────────────────────────
  {
    id: 22,
    scenario: "A technician is troubleshooting NAT and needs to see all currently active address translations in the NAT table. Which command displays these mappings?",
    answer: "show ip nat translations",
    hint: "Four words. 'show ip nat' plus the word for the translation entries.",
    mode: "exec",
    category: "nat",
  },

  // ── HSRP/FHRP ───────────────────────────────────────────────────────────────
  {
    id: 23,
    scenario: "You need to verify HSRP group status on a router, including which router is active, which is standby, the virtual IP, and the current priority. Which command is used?",
    answer: "show standby",
    hint: "Two words. The primary HSRP verification command.",
    mode: "exec",
    category: "fhrp",
  },

  // ── EtherChannel ────────────────────────────────────────────────────────────
  {
    id: 24,
    scenario: "You configured an EtherChannel bundle and need to verify that it is up and see which physical member ports are bundled. Which command provides this in a concise table?",
    answer: "show etherchannel summary",
    hint: "Three words. 'show etherchannel' plus the word for a brief overview.",
    mode: "exec",
    category: "etherchannel",
  },

  // ── System ──────────────────────────────────────────────────────────────────
  {
    id: 25,
    scenario: "You need to save the current running configuration so that it will be restored after a router reload. Which command copies the config to NVRAM?",
    answer: "copy running-config startup-config",
    hint: "Four words. 'copy' followed by source and destination config names.",
    mode: "exec",
    category: "system",
  },
  {
    id: 26,
    scenario: "You are decommissioning a router and need to wipe its NVRAM so it boots to factory defaults. Which command removes the startup configuration?",
    answer: "erase startup-config",
    hint: "Three words. 'erase' followed by the name of the config stored in NVRAM.",
    mode: "exec",
    category: "system",
  },
  {
    id: 27,
    scenario: "You need to verify the Cisco IOS version, the router's uptime, installed hardware modules, and amount of RAM. Which command provides all of this?",
    answer: "show version",
    hint: "Two words. One of the first commands any engineer runs on a new device.",
    mode: "exec",
    category: "system",
  },
  {
    id: 28,
    scenario: "You want to display the configuration that is currently active in RAM on the router. Which command shows the running configuration?",
    answer: "show running-config",
    hint: "Three words. Shows what is active right now, not what was saved.",
    mode: "exec",
    category: "system",
  },

  // ── CDP / Discovery ─────────────────────────────────────────────────────────
  {
    id: 29,
    scenario: "You need to identify all directly connected Cisco devices including their hostnames, device types, local and remote interface names. Which command uses CDP to show this?",
    answer: "show cdp neighbors",
    hint: "Three words. 'show cdp' followed by the word for adjacent devices.",
    mode: "exec",
    category: "troubleshoot",
  },

  // ── MAC Table ───────────────────────────────────────────────────────────────
  {
    id: 30,
    scenario: "You need to view the MAC addresses that a switch has learned and which port each MAC address is associated with. Which command shows the MAC address table?",
    answer: "show mac address-table",
    hint: "Four words. The Layer 2 forwarding table command.",
    mode: "exec",
    category: "switching",
  },
];
