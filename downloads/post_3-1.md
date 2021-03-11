## 3.1 Layer 2 - Part 1

- 3.1.a  Troubleshoot static and dynamic 802.1q trunking protocols
- 3.1.b Troubleshoot static and dynamic EtherChannels

Despite being halfway through the syllabus, this is my first artice and will hopefully form a template of my learning plans.  This wont necessarily be possible for all sections but that plan is to:

1. Check my current knowledge using the OCG "Do I know this already?" or DIKTA quiz at the beginning of each Chapter
2. Read through, summarising **Key Topics** in my own language
3. Create a lab on GNS3 to configure and verify the concepts
4. Write up my understanding in summary articles.  My theory is that if I know a topic well enough to teach it to someone else, then I know it well enough to clear the ENCOR.  *In theory*

Using DIKTA it's apparent that I'm 'OK' with these topics and could probably fudge my way through with liberal use of 

```
#show ?
```

as well as inefficiently tabbing my way round the CLI.

However, that's not the standard I'd expect from an IE or an NP, or frankly even an NA so I now feel compelled to start from scratch.  

> A journey of 1,000 miles, starts with a single step

It's been more than a while since I've looked at DTP, VTP or Etherchannel which might work in my favour.  If I have forgotten or misremembered anything from that ICND1 bootcamp all those years ago, I will now have to re-learn it entirely.

### DTP

*I realise now as I write this article that I don't know DTP well enough.*

There must be more to DTP than knowing the 3 types of DTP mode:

- Trunking
- Dynamic Desirable
- Dynamic Auto

and that Cisco best practice is to set ports to a fixed state, ie Trunk or Access.  

I fire up GNS3 anyway and construct a basic 3 switch lab.  Eventually my GNS3 labs will be available from the [Labs Page](here).  I won't be reinventing the wheel and producing GNS3 Set Up guides as they're ten a penny online.  If you're stuck I'd recommend David Bombal's YouTube channel, he's got multiple series on setting up GNS3 across Windows and OSX and he's an excellent trainer.

![Lab 3.1.a fig 01](/Users/eno/github/website/img/Lab 3.1.a fig 01.png)

I did say basic! So the task here is to look at the different behaviours of different DTP modes.

By default a switchport is in **Dynamic Auto** mode.  Now because both sides cannot be set to Auto, the switches will not form a trunk by default.

To check a port's DTP mode, we run

```
Switch#sh int gi0/0 switchport
Name: Gi0/0
Switchport: Enabled
Administrative Mode: dynamic auto
Operational Mode: static access
Administrative Trunking Encapsulation: negotiate
Operational Trunking Encapsulation: native
Negotiation of Trunking: On
Access Mode VLAN: 1 (default)
Trunking Native Mode VLAN: 1 (default)
Administrative Native VLAN tagging: enabled
Voice VLAN: none
```

This isn't the full output but for this request I'm only looking at the first few lines anyway.  We confirm that it's in Dynamic Auto by default and in this instance that results in port operating as a static access port on the native vlan VLAN1.

We can confirm there's no trunking going on by running

```
Switch#sh int trunk      
Switch#
```

and getting no output.

By this logic, we should be able to set the other side of this connection (SW02 | Gi0/0) to either Trunk or Dynamic Desirable and that should trigger a negotiation to Trunk mode, so let's give it a try.

```
SW02(config)#int gi0/0
SW02(config-if)#switchport mode ?
 access    Set trunking mode to ACCESS unconditionally
 dot1q-tunnel set trunking mode to TUNNEL unconditionally
 dynamic    Set trunking mode to dynamically negotiate access or trunk mode
 private-vlan Set private-vlan mode
 trunk     Set trunking mode to TRUNK unconditionally
SW02(config-if)#switchport mode dynamic desirable 
```

Nothing exciting happens, but if we go back to SW01 then we can confirm that it worked

```
SW01#sh int trunk
Port    Mode       Encapsulation Status    Native vlan
Gi0/0    auto       n-isl     trunking   1
Port    Vlans allowed on trunk
Gi0/0    1-4094
Port    Vlans allowed and active in management domain
Gi0/0    1
Port    Vlans in spanning tree forwarding state and not pruned
Gi0/0    1

SW01#
```

Interestingly the encapsulation is by default set to Cisco's proprietary ISL.  We're only interested in 802.1q for the ENCOR so lets get the encapsulation changed and see if the same behaviour is expected

```
SW01(config)#int gi0/0
SW01(config-if)#switchport trunk encapsulation ?
 dot1q   		Interface uses only 802.1q trunking encapsulation when trunking
 isl    		Interface uses only ISL trunking encapsulation when trunking
 negotiate 	Device will negotiate trunking encapsulation with peer on
 						interface
SW01(config-if)#switchport trunk encapsulation dot1q
SW01(config-if)#
```

Again, no alarm bells but if we verify the other side

```
SW02#sh int trunk
Port    Mode       Encapsulation Status    Native vlan
Gi0/0    desirable    n-802.1q    trunking   1
```

We're looking good.  I'm interested to know whether or not using 802.1q on SW01 and ISL on SW02 is compatible, so will come back to this once I have VLANs set up later in this section under VTP.  To find out if the compatibilty matters, click [here](ISL and 802.1q interop?)

For now, I'm going to follow Cisco's recommendation and set all connected switchports to a static mode, in this case **Trunk**.  For consistency, I will also set them all to use 802.1q encapsulation since that's all we're being asked to learn.

```
SW01(config)#int gi0/1
SW01(config-if)#switchport trunk encapsulation dot1q
SW01(config-if)#switchport mode trunk
SW01(config-if)#end
```

I run through all 3 switches configuring both connected switchports on each, which is how I will save the Lab.  

#### What have we learned?

- Both sides of a trunk cannot be set to auto
- ISL and 802.1q are / ARE NOT compatible

