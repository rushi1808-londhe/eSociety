package com.esociety.backend.services;

import com.esociety.backend.entities.*;
import com.esociety.backend.repositories.*;
import com.lowagie.text.*;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.awt.Color;
import java.io.ByteArrayOutputStream;

@Service
@RequiredArgsConstructor
public class PdfService {

    private final PaymentRepository paymentRepository;
    private final MaintenanceBillRepository maintenanceBillRepository;
    private final ResidentRepository residentRepository;
    private final FlatRepository flatRepository;
    private final SocietyRepository societyRepository;
    private final UserRepository userRepository;

    private static final String[] MONTH_NAMES = {
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
    };

    /**
     * Builds a payment receipt PDF for the given payment and returns the raw bytes.
     * Used by both Resident and Admin controllers for download.
     */
    public byte[] generateReceipt(Long paymentId) throws Exception {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new RuntimeException("Payment not found"));

        MaintenanceBill bill = maintenanceBillRepository.findById(payment.getBillId())
                .orElseThrow(() -> new RuntimeException("Bill not found"));

        Resident resident = residentRepository.findById(payment.getResidentId())
                .orElseThrow(() -> new RuntimeException("Resident not found"));

        Flat flat = flatRepository.findById(resident.getFlatId())
                .orElseThrow(() -> new RuntimeException("Flat not found"));

        Society society = societyRepository.findById(payment.getSocietyId())
                .orElseThrow(() -> new RuntimeException("Society not found"));

        User user = userRepository.findById(resident.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        ByteArrayOutputStream out = new ByteArrayOutputStream();
        Document document = new Document(PageSize.A4, 50, 50, 50, 50);
        PdfWriter.getInstance(document, out);
        document.open();

        Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 20, Color.DARK_GRAY);
        Font headingFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 13, Color.BLACK);
        Font labelFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 11, Color.BLACK);
        Font valueFont = FontFactory.getFont(FontFactory.HELVETICA, 11, Color.BLACK);
        Font smallFont = FontFactory.getFont(FontFactory.HELVETICA, 9, Color.GRAY);

        // Header
        Paragraph title = new Paragraph(society.getName(), titleFont);
        title.setAlignment(Element.ALIGN_CENTER);
        document.add(title);

        Paragraph address = new Paragraph(
                society.getAddress() + ", " + society.getCity() + ", " + society.getState(), smallFont);
        address.setAlignment(Element.ALIGN_CENTER);
        address.setSpacingAfter(15);
        document.add(address);

        Paragraph receiptTitle = new Paragraph("PAYMENT RECEIPT", headingFont);
        receiptTitle.setAlignment(Element.ALIGN_CENTER);
        receiptTitle.setSpacingAfter(20);
        document.add(receiptTitle);

        // Resident & payment details table
        PdfPTable table = new PdfPTable(2);
        table.setWidthPercentage(100);
        table.setWidths(new float[]{1, 1});

        addRow(table, "Receipt No.", "RCPT-" + payment.getPaymentId(), labelFont, valueFont);
        addRow(table, "Payment Date", payment.getPaymentDate(), labelFont, valueFont);
        addRow(table, "Resident Name", user.getName(), labelFont, valueFont);
        addRow(table, "Flat No.", flat.getFlatNumber(), labelFont, valueFont);
        addRow(table, "Billing Period", MONTH_NAMES[bill.getBillMonth() - 1] + " " + bill.getBillYear(), labelFont, valueFont);
        addRow(table, "Flat Charge", String.format("Rs. %.2f", bill.getFlatCharge()), labelFont, valueFont);
        addRow(table, "Parking Charge", String.format("Rs. %.2f", bill.getParkingCharge()), labelFont, valueFont);
        if (bill.getLateFee() != null && bill.getLateFee() > 0) {
            addRow(table, "Late Fee", String.format("Rs. %.2f", bill.getLateFee()), labelFont, valueFont);
        }
        addRow(table, "Amount Paid", String.format("Rs. %.2f", payment.getAmountPaid()), labelFont, valueFont);
        addRow(table, "Payment Status", payment.getStatus().toString(), labelFont, valueFont);
        if (payment.getGatewayTxnId() != null) {
            addRow(table, "Transaction ID", payment.getGatewayTxnId(), labelFont, valueFont);
        }

        document.add(table);

        Paragraph footer = new Paragraph(
                "\n\nThis is a system-generated receipt and does not require a signature.", smallFont);
        footer.setSpacingBefore(30);
        footer.setAlignment(Element.ALIGN_CENTER);
        document.add(footer);

        document.close();
        return out.toByteArray();
    }

    private void addRow(PdfPTable table, String label, String value, Font labelFont, Font valueFont) {
        PdfPCell labelCell = new PdfPCell(new Phrase(label, labelFont));
        labelCell.setBorder(Rectangle.BOTTOM);
        labelCell.setPadding(6);

        PdfPCell valueCell = new PdfPCell(new Phrase(value, valueFont));
        valueCell.setBorder(Rectangle.BOTTOM);
        valueCell.setPadding(6);

        table.addCell(labelCell);
        table.addCell(valueCell);
    }
}
