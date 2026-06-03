"use client";

import { X, Phone, MessageCircle, Mail, Facebook, Instagram, Youtube, Linkedin, MapPin, Globe } from "lucide-react";
import { useState } from "react";

const Footer = () => {
  const [activePopup, setActivePopup] = useState<string | null>(null);

  const policies = [
    { name: "Disclaimer", key: "disclaimer" },
    { name: "Terms & Conditions", key: "terms" },
    { name: "Privacy Policy", key: "privacy" },
    { name: "Refund Policy", key: "refund" },
    { name: "Cookies Policy", key: "cookies" }
  ];

  const contactChannels = [
    { icon: Phone, label: "Call", href: "tel:+918460567890" },
    { icon: MessageCircle, label: "WhatsApp", href: "https://wa.me/918460567890" },
    { icon: Mail, label: "Email", href: "mailto:ivantaproperty@gmail.com" },
    { icon: Facebook, label: "Facebook", href: "https://www.facebook.com/ivantaproperty" },
    { icon: Instagram, label: "Instagram", href: "https://www.instagram.com/ivantaproperty/" },
    { icon: Youtube, label: "YouTube", href: "#" },
    { icon: Linkedin, label: "LinkedIn", href: "https://www.linkedin.com/company/ivanta-property/" },
  ];

  const policyContent: Record<string, { title: string; content: string }> = {
    disclaimer: {
      title: "Disclaimer",
      content: `
        <h3 class="font-semibold text-lg mb-3">IF YOU HAVE ANY QUERIES, PLEASE CONTACT US</h3>

        <p class="mb-4">Ivanta Property Properties is only an intermediary offering its platform to advertise properties of Seller for a Customer/Buyer/User coming on its Website and is not and cannot be a party to or privy to or control in any manner any transactions between the Seller and the Customer/Buyer/User.</p>

        <p class="mb-4">All the offers and discounts on this Website have been extended by various Builder(s)/Developer(s) who have advertised their products.</p>

        <p class="mb-4">Ivanta Property is only communicating the offers and not selling or rendering any of those products or services. It neither warrants nor is it making any representations with respect to offer(s) made on the site.</p>

        <p class="mb-4">The information provided on ivantaproperty.com is for general informational purposes only. While we strive to ensure the accuracy and reliability of the property listings and other related content, ivantaproperty.com makes no representations or warranties of any kind, express or implied, about the completeness, accuracy, reliability, suitability, or availability of the information, products, or services contained on the website.</p>

        <p class="mb-4">ivantaproperty.com acts as an online platform that connects property seekers with sellers, agents, and developers. We do not own, sell, or lease any property directly, nor do we guarantee the authenticity or legality of any listings. Users are advised to independently verify all information and conduct their own due diligence before entering into any property transactions.</p>

        <p class="mb-4">Under no circumstances shall ivantaproperty.com or its affiliates be liable for any loss, damage, or expense arising out of or in connection with the use of the website or reliance on any information provided herein.</p>

        <p class="mb-4">By using this website, you acknowledge that you have read, understood, and agree to this disclaimer.</p>
      `
    },
    terms: {
      title: "Terms & Conditions",
      content: `
        <p class="mb-4">Welcome to ivantaproperty.com, a platform for property listings, discovery, and real estate promotions. By accessing or using our website, services, or any associated features, you agree to comply with and be bound by the following Terms & Conditions.</p>
        <p class="mb-4">Please read these terms carefully.</p>
        
        <h3 class="font-semibold text-lg mb-3 mt-6">Acceptance of Terms</h3>
        <p class="mb-4">By using ivantaproperty.com, you confirm that:</p>
        <p class="mb-4">You are at least 18 years old or have the legal capacity to enter into agreements.</p>
        <p class="mb-4">You have read, understood, and agreed to be bound by these Terms & Conditions.</p>
        
        <h3 class="font-semibold text-lg mb-3 mt-6">Services Offered</h3>
        <p class="mb-4">We provide a digital platform for:</p>
        <p class="mb-4">Listing residential and commercial properties for sale or rent.</p>
        <p class="mb-4">Exploring real estate listings by category, location, or configuration.</p>
        <p class="mb-4">Promoting featured listings (paid plans).</p>
        <p class="mb-4">Note: We are not a real estate broker or agent. We do not own or manage the properties listed on our platform.</p>
        
        <h3 class="font-semibold text-lg mb-3 mt-6">User Responsibilities</h3>
        <p class="mb-4">As a user of ivantaproperty.com, you agree to:</p>
        <p class="mb-4">Provide accurate and truthful information in your listings.</p>
        <p class="mb-4">Not upload misleading, illegal, or copyrighted material.</p>
        <p class="mb-4">Maintain the confidentiality of your account credentials.</p>
        <p class="mb-4">Abide by all applicable local laws and regulations related to property transactions.</p>
        
        <h3 class="font-semibold text-lg mb-3 mt-6">Listing Content and Moderation</h3>
        <p class="mb-4">We reserve the right to:</p>
        <p class="mb-4">Review, edit, or remove any listing that violates our policies or appears fraudulent.</p>
        <p class="mb-4">Suspend or ban user accounts that misuse the platform or submit inappropriate content.</p>
        
        <h3 class="font-semibold text-lg mb-3 mt-6">Payments and Refunds</h3>
        <p class="mb-4">Payments made for premium listings or featured ads are governed by our Refund Policy.</p>
        <p class="mb-4">All transactions are processed securely, and we do not store your payment details.</p>
        
        <h3 class="font-semibold text-lg mb-3 mt-6">Intellectual Property</h3>
        <p class="mb-4">We reserve the right to modify these Terms and Conditions at any time. Users will be notified of significant changes, and continued use of the platform constitutes acceptance of the modified terms.</p>
        <p class="mb-4">All content, design, trademarks, and branding on ivantaproperty.com are the property of the website owner or licensed sources and may not be copied or reused without permission.</p>

        <h3 class="font-semibold text-lg mb-3 mt-6">Limitation of Liability</h3>
        <p class="mb-4">We are not responsible for:</p>
        <p class="mb-4">The accuracy of property listings provided by users.</p>
        <p class="mb-4">Any disputes, transactions, or communication between buyers, sellers, or agents.</p>
        <p class="mb-4">Losses, damages, or delays caused by technical issues or service interruptions.</p>
        <p class="mb-4">Use of this platform is at your own risk.</p>

        <h3 class="font-semibold text-lg mb-3 mt-6">Modifications to Terms</h3>
        <p class="mb-4">We reserve the right to update or change these Terms & Conditions at any time. Any changes will be posted here, and your continued use of the site after such changes means you accept them.</p>

        <h3 class="font-semibold text-lg mb-3 mt-6">Governing Law</h3>
        <p class="mb-4">These Terms shall be governed and interpreted under the laws of India. Any disputes arising will be subject to the jurisdiction of courts located in Rajkot, Gujarat, India.</p>
      `
    },
    privacy: {
      title: "Privacy Policy",
      content: `
        <p class="mb-4">By accessing or using our website, mobile applications, software, data feeds, and services (collectively referred to as the “Service”), you are indicating your acceptance of these terms and conditions (the “Terms of Service”) as well as our privacy policy (the “Privacy Policy”). If you do not agree to any of these terms, please refrain from using the Service.</p>

        <p class="mb-4">Welcome to Ivantaproperty.com! We are a digital platform providing real estate advertising, marketing, and information services, connecting individuals with the real estate market. Ivantaproperty.com, along with its subsidiaries and affiliates (collectively referred to as the “Company” or “Ivantaproperty.com”), offers a range of services, including but not limited to the https://www.ivantaproperty.com website (the “Website”) and ivantaproperty.com’s mobile applications (the “Mobile App”), as well as all products and services available through these platforms (collectively referred to as the “Services”). The Website and Mobile App are owned and operated by Ivantaproperty.com, a company incorporated under the laws of India.</p>

        <p class="mb-4">This document, along with the Privacy Policy, constitutes an electronic record as per the Information Technology Act, 2000, and the relevant rules thereunder, including any amendments, concerning electronic records in various statutes as amended by the Information Technology Act, 2000. These “Terms of Use” constitute an electronic record under the applicable law. This electronic record is generated by a computer system and does not require any physical or digital signatures.</p>

        <h3 class="font-semibold text-lg mb-3">This policy applies to various groups of individuals who engage with our Services:</h3>

        <p class="mb-4">Users: Refers to all individuals utilizing our Services.</p>

        <p class="mb-4">Real Estate Professionals (REPs): Includes users who have registered accounts, whether free or paid, for purposes such as selling or renting real estate, utilizing advertising services, or accessing other services tailored for the professional real estate community. This group encompasses landlords, agents, developers, institutional property consultants, mortgage professionals, and other related service providers.</p>

        <p class="mb-4">We collect information from all users of our Services, employing technologies like cookies, web beacons, log data, and third-party analytics services to gather and analyze data such as search preferences, ad interactions, and location. Personal information like names, mobile numbers, and email addresses provided during account creation or while interacting with our services is collected to enhance user experience and customize our offerings.</p>

        <p class="mb-4">Log Data, automatically recorded by our servers, includes details like IP addresses, browser types, and pages visited, among others. We utilize this data to provide, measure, and improve our Services. However, this policy excludes any responsibility for information collected by third parties through our Services or linked websites and advertisements.</p>

        <p class="mb-4">Cookies, both session and persistent, are employed to keep users logged in, understand interaction patterns, and monitor usage. Users can manage cookie preferences through browser settings but disabling cookies may affect certain functionalities.</p>

        <p class="mb-4">For REPs, additional information is collected during account setup, including names, company names, contact details, and property information. Financial data, like credit card information, is collected from subscribers for billing purposes, with calls possibly recorded for quality assurance.</p>

        <p class="mb-4">Third-party sources may provide additional information to enhance user experience, which may be shared with selected REPs upon user consent.</p>

        <p class="mb-4">Location Data provided by users is stored and utilized for localized features, analysis, targeted advertising, and service customization.</p>

        <h3 class="font-semibold text-lg mb-3">Reasons for Collecting Information:</h3>

        <p class="mb-4">Personalization: We collect information to tailor our Services to your needs, ensuring you receive the most relevant information for your circumstances and optimizing your experience.</p>

        <p class="mb-4">Connectivity: Our aim is to keep you connected with Ivantaproperty.com across various online platforms and to provide timely updates on residential real estate-related news and information.</p>

        <p class="mb-4">Facilitating Transactions: We gather information to facilitate connections with individuals or entities involved in residential real estate transactions, including buying, selling, renting, obtaining mortgages, and accessing related services. Additionally, we strive to optimize the information shared with these parties to foster productive and efficient relationships.</p>

        <p class="mb-4">Description of Services: Ivantaproperty.com endeavour’s to maintain accuracy in its service descriptions. However, we cannot guarantee that the content on our site is always accurate, complete, reliable, current, or free of errors. Additionally, access to our Services may be intermittently suspended or restricted for maintenance, repairs, or the introduction of new features, with efforts made to minimize disruptions. We provide links to external sites over which we have no control and do not endorse or assume responsibility for the content, products, or services offered on these sites.</p>

        <p class="mb-4">Information Sharing: Periodically, we may share information with reputable organizations whose products or services align with your interests and requirements. If you prefer not to have your information shared with such companies or organizations, please inform us via email athousivity.dev@gmail.com. Furthermore, if you wish to delete your information from our website, please notify us at the same email address.</p>

        <p class="mb-4">Telephone Communication: Individuals who provide their telephone numbers online may receive telephone calls or text messages from us regarding new products, services, or upcoming events. By accessing our Services, you consent to receiving such communications and waive any restrictions imposed by the Do Not Disturb (DND) registry. If you do not wish to receive telephone calls or text messages, please contact us via email athousivity.dev@gmail.com.</p>

        <p class="mb-4">Regarding Ad Servers: In order to present you with offers tailored to your interests, we have partnerships with other companies that may place advertisements on our Website and Mobile App. During your visit to our platforms, these ad server companies may collect information such as your domain type, IP address, and clickstream data.</p>

        <h3 class="font-semibold text-lg mb-3">Direct Contact with Real Estate Professionals (REPs):</h3>

        <p class="mb-4">If you use our contact forms to reach out to a REP or make calls to REPs through our Services, we may share the personally identifiable information you provide us, along with details about your usage of our Services, with the intended party. This includes information you input, such as home search criteria, as well as Log Data collected during your use of the Services. If a REP wishes to contact you based on the anonymized profile of Ivantaproperty.com pages you’ve visited, we will facilitate that connection. On occasions when we collaborate with third parties to enhance the quality of connections provided to our subscriber REPs, we may share limited personally identifiable information with them for this specific purpose. By providing this information, you agree to share your details with third parties as well.</p>

        <p class="mb-4">Monitoring and Recording Communications: Any communications between buyers and sellers or between users and the Company may be monitored or recorded by us for quality control and training purposes. This includes telephonic conversations.</p>

        <p class="mb-4">Mortgage Services: If you request a mortgage quote through our services, you authorize us to share your personally identifiable information with financial institutions solely for the purpose of providing such products and/or services. These institutions are prohibited from using the information for any other purpose.</p>

        <p class="mb-4">User-Generated Content: When utilizing our user-generated content services, such as posting questions, answers, or blogs on our Website and Mobile App, please be aware that any personally identifiable information you submit may be accessed, collected, or used by other users and could result in unsolicited messages. We are not liable for the personally identifiable information you choose to disclose in these forums, nor for the comments or remarks posted by other users. We advise you to conduct your own due diligence before relying on any information shared in these forums.</p>

        <p class="mb-4">Reporting Issues: Verified rights owners can report listing issues by contactinghousivity.dev@gmail.com.</p>

        <h3 class="font-semibold text-lg mb-3">Representations and Warranties by Real Estate Professionals (REPs):</h3>

        <p class="mb-4">By registering and/or listing properties on our Website and/or Mobile App, each REP represents and warrants that:</p>

        <p class="mb-4">1. They possess all necessary rights to list the properties on the platform without violating or infringing upon the rights, including intellectual property rights, of any other individual or entity, and any applicable laws.</p>

        <p class="mb-4">2. They are in compliance with all regulatory requirements, including those outlined in the Real Estate (Regulation and Development) Act 2016, regarding the services/products offered through the platform and the listings/advertisements posted.</p>

        <p class="mb-4">3. All details provided for the properties listed on the platform are current, accurate, and up-to-date, including location, specifications, and pricing.</p>

        <p class="mb-4">4. By listing properties on the platform, REPs grant Ivantaproperty.com the necessary rights to utilize and/or share such listing details in any manner, including on other websites or platforms operated by Ivantaproperty.com or its associates or third parties.</p>

        <p class="mb-4">Disclaimers related to completeness and authenticity of content/listings:</p>

        <p class="mb-4">Users are advised to conduct checks to establish the authenticity of any property or project, including its title, built-up area, and suitability for purchase/rental, at their own expense.</p>

        <p class="mb-4">Ivantaproperty.com, as an advertising platform, does not validate the authenticity of content within its Services. While efforts are made to address complaints, users should exercise caution and conduct their own due diligence.</p>

        <p class="mb-4">Users should independently verify ownership credentials and visit properties in person to ensure authenticity and validity.</p>

        <p class="mb-4">It is recommended to verify compliance with the Real Estate (Regulation and Development) Act 2016 for the relevant property or project.</p>

        <p class="mb-4">Information provided by developers is relied upon but should be independently validated. Users should verify details from the respective developers or regulatory authorities before making purchase decisions.</p>

        <p class="mb-4">Ivantaproperty.com provides information collated by its research team for users’ research and awareness about the real estate market. While efforts are made to ensure completeness and accuracy, users are encouraged to independently validate the information before making decisions.</p>

        <p class="mb-4">Copyright and Trademark Policy:</p>

        <p class="mb-4">All content included in our Services, such as text, graphics, logos, and software, is the property of Ivantaproperty.com, its users, and its content suppliers, protected by copyright laws. All other trademarks not owned by Ivantaproperty.com are the property of their respective owners.</p>

        <p class="mb-4">For verified rights owners seeking to report listing issues, please contact housivity.dev@gmail.com.</p>

        <p class="mb-4">General Matters:</p>

        <p class="mb-4">Users are responsible for maintaining the accuracy and confidentiality of their account information, including passwords and email addresses.</p>

        <p class="mb-4">Our Website/Mobile App may contain links to third-party websites. We do not accept liability for the misuse of information by linked websites or the content on websites utilizing Ivantaproperty.com’s search functionality.</p>

        <p class="mb-4">Users expressing interest in obtaining a home loan consent to sharing personally identifiable information with financial institutions. This consent supersedes any registration for Do Not Call (DNC/NDNC) lists.</p>

        <p class="mb-4">Information about users and our Website/Mobile App may be disclosed in the event of mergers, acquisitions, or other business transactions.</p>

        <p class="mb-4">Indemnification and Limitation of Liability:</p>

        <p class="mb-4">Users agree to indemnify Ivantaproperty.com and its affiliates against any losses, liabilities, claims, damages, or expenses arising from breaches of representation, warranty, covenant, or agreement, or from third-party claims related to their use of the Services.</p>

        <p class="mb-4">Ivantaproperty.com and its affiliates shall not be liable for any special, incidental, indirect, consequential, or punitive damages arising from users’ use of the Services or services provided by registered service providers.</p>

        <p class="mb-4">Amendment to the Terms of Service: We reserve the right to change, modify, add, or remove portions of the Terms of Use without prior notice. Users are encouraged to review these terms periodically.</p>

        <p class="mb-4">Conclusion</p>

        <p class="mb-4">Participants agree to the contest terms and conditions outlined by Ivantaproperty.com.</p>
      `
    },
    refund: {
      title: "Refund Policy",
      content: `
        <p class="mb-4">At ivantaproperty.com, we strive to provide a transparent and trustworthy platform for property listings and related services. Please read our refund policy carefully before purchasing any paid service or plan on our website.</p>

        <h3 class="font-semibold text-lg mb-3">Paid Listings and Services</h3>
        
        <p class="mb-4">All payments made for featured listings, promotional packages, or any other premium services are non-refundable, except in the following cases:</p>

        <p class="mb-4">The service was not delivered as promised due to a technical error on our side.</p>

        <p class="mb-4">You were charged more than once for the same service due to a system error.</p>

        <p class="mb-4">In these rare cases, you must notify us within 7 days of the payment to request a refund.</p>

        <h3 class="font-semibold text-lg mb-3">Eligibility for Refund</h3>

        <p class="mb-4">To be eligible for a refund, you must:</p>

        <p class="mb-4">Provide valid proof of payment (transaction ID, screenshot, etc.).</p>

        <p class="mb-4">Clearly explain the issue or discrepancy.</p>

        <p class="mb-4">Submit your request via email to support@ivantaproperty.com within the refund window.</p>

        <p class="mb-4">Once your refund request is reviewed and approved, the amount will be refunded to your original payment method within 7–10 business days.</p>

        <h3 class="font-semibold text-lg mb-3">No Refunds in These Cases</h3>

        <p class="mb-4">Refunds will not be provided if:</p>

        <p class="mb-4">You changed your mind after purchasing a paid service.</p>

        <p class="mb-4">You failed to use the service within the listing duration.</p>

        <p class="mb-4">The property did not sell or get inquiries (we do not guarantee results).</p>

        <p class="mb-4">You submitted incorrect or misleading listing information that led to removal.</p>

        <h3 class="font-semibold text-lg mb-3">Cancellations</h3>

        <p class="mb-4">You can cancel any free or unpaid listing at any time. For paid listings, cancellations do not qualify for refunds unless the criteria above are met.</p>
      `
    },
    cookies: {
      title: "Cookies Policy",
      content: `
        <p class="mb-4">This Cookies Policy explains how ivantaproperty.com (“we”, “us”, or “our”) uses cookies and similar technologies to recognize you when you visit our website at www.ivantaproperty.com. It explains what these technologies are and why we use them, as well as your rights to control our use of them.</p>

        <h3 class="font-semibold text-lg mb-3">What Are Cookies?</h3>

        <p class="mb-4">Cookies are small data files placed on your device when you visit a website. They are widely used to make websites work more efficiently and to provide reporting information, enhance user experience, and deliver relevant content or advertisements.</p>

        <h3 class="font-semibold text-lg mb-3">How We Use Cookies</h3>

        <p class="mb-4">We use cookies for the following purposes:</p>

        <p class="mb-4">Essential Cookies: To enable core functionality like security, network management, and accessibility.</p>

        <p class="mb-4">Performance and Analytics Cookies: To understand how visitors interact with the website, which helps us improve it.</p>

        <p class="mb-4">Functionality Cookies: To remember your preferences and personalize your experience.</p>

        <p class="mb-4">Advertising Cookies: (If applicable) To deliver relevant advertisements based on your interests.</p>

        <h3 class="font-semibold text-lg mb-3">Third-Party Cookies</h3>

        <p class="mb-4">We may allow third-party service providers (e.g., Google Analytics, Facebook Pixel) to set cookies to collect information about your use of our website for performance monitoring or advertising purposes.</p>

        <h3 class="font-semibold text-lg mb-3">Your Choices</h3>

        <p class="mb-4">You can control and manage cookies in your browser settings. Please note that disabling cookies may affect your user experience and some parts of the site may not function properly.</p>

        <p class="mb-4">To opt out of certain third-party cookies, you can visit:</p>

        <p class="mb-4">Google Ads Settings</p>

        <p class="mb-4">Network Advertising Initiative</p>

        <p class="mb-4">Your Online Choices</p>

        <h3 class="font-semibold text-lg mb-3">Changes to This Policy</h3>

        <p class="mb-4">We may update this Cookies Policy from time to time. When we do, we will revise the “Effective Date” at the top of the policy.</p>
      `
    }
  };

  return (
    <>
      <footer className="bg-foreground text-primary-foreground/80">
        <div className="container mx-auto px-4 lg:px-6 py-8">
          {/* Connect With Us Section */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-primary-foreground mb-4 text-center">Connect With Us</h3>
            <div className="flex flex-wrap justify-center gap-3">
              {contactChannels.map((channel) => (
                <a
                  key={channel.label}
                  href={channel.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-primary-foreground/10 hover:bg-primary-foreground/20 rounded-lg transition-colors"
                >
                  <channel.icon className="w-4 h-4" />
                  <span className="text-sm">{channel.label}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Location & Contact Info */}
          <div className="border-t border-primary-foreground/10 pt-6 mb-6">
            <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-x-8 gap-y-3 text-sm text-primary-foreground/70">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-primary-foreground/50" />
                <span>Ivanta Ventures LLP, 903, Sanskar Heights, Umiya Circle, 150 Ft Ring Road, Mavdi, Rajkot - 360004<br /><span className="text-primary-foreground/40 text-xs">(Landmark - The Galleria Hotel &amp; Rooftop Restaurant)</span></span>
              </div>
              <div className="flex flex-col gap-2">
                <a href="tel:+918460567890" className="flex items-center gap-2 hover:text-primary-foreground transition-colors">
                  <Phone className="w-4 h-4 shrink-0 text-primary-foreground/50" />
                  <span>(+91) 84605 67890</span>
                </a>
                <a href="mailto:ivantaproperty@gmail.com" className="flex items-center gap-2 hover:text-primary-foreground transition-colors">
                  <Mail className="w-4 h-4 shrink-0 text-primary-foreground/50" />
                  <span>ivantaproperty@gmail.com</span>
                </a>
                <a href="https://www.ivantaproperty.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-primary-foreground transition-colors">
                  <Globe className="w-4 h-4 shrink-0 text-primary-foreground/50" />
                  <span>www.ivantaproperty.com</span>
                </a>
              </div>
            </div>
          </div>

          <div className="border-t border-primary-foreground/10 pt-6">
            {/* Disclaimer Text */}
            <p className="text-center text-[10px] text-primary-foreground/40 mb-4 leading-relaxed">
              Ivanta Property is an intermediary platform offering online marketplace services for real estate properties. 
              We do not undertake any real estate brokerage activities as defined under the Real Estate (Regulation and Development) Act, 2016. 
              All property information is provided by property owners, agents, or third-party sources. 
              Users are advised to verify all details independently before making any property decisions. 
              Ivanta Property is not responsible for any transactions between users and property owners/agents.
            </p>
            
            {/* Policy Links */}
            <div className="flex flex-wrap justify-center gap-3 mb-4">
              {policies.map((policy) => (
                <button
                  key={policy.key}
                  onClick={() => setActivePopup(policy.key)}
                  className="text-xs text-primary-foreground/60 hover:text-primary-foreground transition-colors underline"
                >
                  {policy.name}
                </button>
              ))}
            </div>
            
            {/* Copyright */}
            <div className="text-center mt-6">
              <p className="text-sm text-primary-foreground/60 mb-2">
                Copyright © {new Date().getFullYear()} Ivanta Ventures LLP
              </p>
              <a 
                href="https://wa.me/9879470807" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-primary to-accent px-4 py-2 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer"
              >
                <span className="text-white text-sm font-medium">Website & Application by</span>
                <span className="text-white font-bold text-base flex items-center gap-1">
                  Bitcoder
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </span>
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* Policy Popups */}
      {activePopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[80vh] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="text-2xl font-heading font-bold text-foreground">
                {policyContent[activePopup].title}
              </h2>
              <button
                onClick={() => setActivePopup(null)}
                className="p-2 hover:bg-secondary rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(80vh-140px)] text-sm text-muted-foreground">
              <div dangerouslySetInnerHTML={{ __html: policyContent[activePopup].content }} />
            </div>
            
          </div>
        </div>
      )}
    </>
  );
};

export default Footer;
