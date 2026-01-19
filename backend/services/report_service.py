"""
Report Service Module

Generates comprehensive reports for Joyce Suites admin and caretaker dashboards.
Provides insights into payments, occupancy, and tenant information.

This module maintains separation of concerns and returns structured data
suitable for direct JSON serialization in Flask responses.
"""

from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
from decimal import Decimal
from enum import Enum


class PaymentStatus(Enum):
    """Enumeration for payment statuses."""
    PAID = "paid"
    PENDING = "pending"
    OVERDUE = "overdue"


class ReportService:
    """Service class for generating various reports."""

    def generate_payment_report(
        self,
        month: int,
        year: int
    ) -> Dict[str, Any]:
        """
        Generate a comprehensive payment report for a specific month.
        
        Args:
            month: Month number (1-12)
            year: Year (e.g., 2025)
        
        Returns:
            Dictionary containing payment summary, details, and statistics
        """
        if not (1 <= month <= 12):
            return {
                "success": False,
                "error": "Month must be between 1 and 12"
            }
        
        if year < 2020 or year > datetime.now().year + 1:
            return {
                "success": False,
                "error": "Invalid year provided"
            }
        
        try:
            mock_payments = [
                {
                    "payment_id": "PAY001",
                    "tenant_id": 1,
                    "tenant_name": "John Doe",
                    "room_number": 101,
                    "amount": 25000.00,
                    "status": PaymentStatus.PAID.value,
                    "payment_date": f"{year}-{month:02d}-05",
                    "due_date": f"{year}-{month:02d}-01"
                },
                {
                    "payment_id": "PAY002",
                    "tenant_id": 2,
                    "tenant_name": "Jane Smith",
                    "room_number": 102,
                    "amount": 22000.00,
                    "status": PaymentStatus.PENDING.value,
                    "payment_date": None,
                    "due_date": f"{year}-{month:02d}-01"
                },
                {
                    "payment_id": "PAY003",
                    "tenant_id": 3,
                    "tenant_name": "Bob Johnson",
                    "room_number": 103,
                    "amount": 28000.00,
                    "status": PaymentStatus.OVERDUE.value,
                    "payment_date": None,
                    "due_date": f"{year}-{month:02d}-01"
                }
            ]
            
            total_expected = sum(p["amount"] for p in mock_payments)
            total_paid = sum(
                p["amount"] for p in mock_payments 
                if p["status"] == PaymentStatus.PAID.value
            )
            total_pending = sum(
                p["amount"] for p in mock_payments 
                if p["status"] in [PaymentStatus.PENDING.value, PaymentStatus.OVERDUE.value]
            )
            
            paid_count = len([p for p in mock_payments if p["status"] == PaymentStatus.PAID.value])
            pending_count = len([p for p in mock_payments if p["status"] == PaymentStatus.PENDING.value])
            overdue_count = len([p for p in mock_payments if p["status"] == PaymentStatus.OVERDUE.value])
            
            collection_rate = (total_paid / total_expected * 100) if total_expected > 0 else 0
            
            report = {
                "success": True,
                "report_type": "payment",
                "period": f"{year}-{month:02d}",
                "generated_at": datetime.now().isoformat(),
                "summary": {
                    "total_expected": float(total_expected),
                    "total_paid": float(total_paid),
                    "total_pending": float(total_pending),
                    "collection_rate": round(collection_rate, 2),
                    "paid_units": paid_count,
                    "pending_units": pending_count,
                    "overdue_units": overdue_count
                },
                "payments": mock_payments
            }
            
            return report
        except Exception as e:
            return {
                "success": False,
                "error": f"Failed to generate payment report: {str(e)}"
            }

    def generate_occupancy_report(self) -> Dict[str, Any]:
        """
        Generate an occupancy report showing occupied vs available rooms.
        
        Returns:
            Dictionary containing occupancy statistics and room details
        """
        try:
            total_rooms = 20
            occupied_rooms = [
                {
                    "room_id": 101,
                    "room_number": "101",
                    "floor": 1,
                    "tenant_id": 1,
                    "tenant_name": "John Doe",
                    "occupancy_date": "2024-06-15",
                    "status": "occupied"
                },
                {
                    "room_id": 102,
                    "room_number": "102",
                    "floor": 1,
                    "tenant_id": 2,
                    "tenant_name": "Jane Smith",
                    "occupancy_date": "2024-09-01",
                    "status": "occupied"
                },
                {
                    "room_id": 103,
                    "room_number": "103",
                    "floor": 1,
                    "tenant_id": 3,
                    "tenant_name": "Bob Johnson",
                    "occupancy_date": "2023-12-10",
                    "status": "occupied"
                }
            ]
            
            available_rooms = [
                {
                    "room_id": 104,
                    "room_number": "104",
                    "floor": 1,
                    "status": "available"
                },
                {
                    "room_id": 201,
                    "room_number": "201",
                    "floor": 2,
                    "status": "available"
                }
            ]
            
            occupied_count = len(occupied_rooms)
            available_count = len(available_rooms)
            occupancy_rate = (occupied_count / total_rooms * 100) if total_rooms > 0 else 0
            
            report = {
                "success": True,
                "report_type": "occupancy",
                "generated_at": datetime.now().isoformat(),
                "summary": {
                    "total_rooms": total_rooms,
                    "occupied_rooms": occupied_count,
                    "available_rooms": available_count,
                    "occupancy_rate": round(occupancy_rate, 2)
                },
                "occupied": occupied_rooms,
                "available": available_rooms
            }
            
            return report
        except Exception as e:
            return {
                "success": False,
                "error": f"Failed to generate occupancy report: {str(e)}"
            }

    def generate_tenant_report(self) -> Dict[str, Any]:
        """
        Generate a comprehensive tenant report with contact and payment information.
        
        Returns:
            Dictionary containing active tenants, balances, and contact details
        """
        try:
            mock_tenants = [
                {
                    "tenant_id": 1,
                    "name": "John Doe",
                    "email": "john.doe@example.com",
                    "phone": "+254712345678",
                    "room_number": "101",
                    "room_id": 101,
                    "contract_start": "2024-06-15",
                    "contract_end": "2025-06-15",
                    "monthly_rent": 25000.00,
                    "balance": 0.00,
                    "status": "active",
                    "last_payment_date": "2025-01-05"
                },
                {
                    "tenant_id": 2,
                    "name": "Jane Smith",
                    "email": "jane.smith@example.com",
                    "phone": "+254723456789",
                    "room_number": "102",
                    "room_id": 102,
                    "contract_start": "2024-09-01",
                    "contract_end": "2025-09-01",
                    "monthly_rent": 22000.00,
                    "balance": 22000.00,
                    "status": "active",
                    "last_payment_date": "2024-12-05"
                },
                {
                    "tenant_id": 3,
                    "name": "Bob Johnson",
                    "email": "bob.johnson@example.com",
                    "phone": "+254734567890",
                    "room_number": "103",
                    "room_id": 103,
                    "contract_start": "2023-12-10",
                    "contract_end": "2025-12-10",
                    "monthly_rent": 28000.00,
                    "balance": 56000.00,
                    "status": "active",
                    "last_payment_date": "2024-11-20"
                }
            ]
            
            total_tenants = len(mock_tenants)
            total_monthly_rent = sum(t["monthly_rent"] for t in mock_tenants)
            total_outstanding_balance = sum(t["balance"] for t in mock_tenants)
            
            tenants_with_balance = [t for t in mock_tenants if t["balance"] > 0]
            
            report = {
                "success": True,
                "report_type": "tenant",
                "generated_at": datetime.now().isoformat(),
                "summary": {
                    "total_active_tenants": total_tenants,
                    "total_monthly_rent_expected": float(total_monthly_rent),
                    "total_outstanding_balance": float(total_outstanding_balance),
                    "tenants_with_arrears": len(tenants_with_balance),
                    "average_balance": round(
                        float(total_outstanding_balance) / total_tenants if total_tenants > 0 else 0,
                        2
                    )
                },
                "tenants": mock_tenants,
                "tenants_in_arrears": tenants_with_balance
            }
            
            return report
        except Exception as e:
            return {
                "success": False,
                "error": f"Failed to generate tenant report: {str(e)}"
            }

    def generate_combined_dashboard_report(self) -> Dict[str, Any]:
        """
        Generate a combined dashboard report with key metrics.
        
        Useful for admin dashboard overview.
        
        Returns:
            Dictionary containing aggregated data from all reports
        """
        try:
            current_date = datetime.now()
            payment_report = self.generate_payment_report(
                current_date.month,
                current_date.year
            )
            occupancy_report = self.generate_occupancy_report()
            tenant_report = self.generate_tenant_report()
            
            if not all([
                payment_report.get("success"),
                occupancy_report.get("success"),
                tenant_report.get("success")
            ]):
                return {
                    "success": False,
                    "error": "Failed to generate combined report"
                }
            
            dashboard = {
                "success": True,
                "report_type": "dashboard",
                "generated_at": datetime.now().isoformat(),
                "key_metrics": {
                    "collection_rate": payment_report["summary"]["collection_rate"],
                    "occupancy_rate": occupancy_report["summary"]["occupancy_rate"],
                    "outstanding_balance": tenant_report["summary"]["total_outstanding_balance"],
                    "total_active_tenants": tenant_report["summary"]["total_active_tenants"],
                    "total_available_rooms": occupancy_report["summary"]["available_rooms"]
                },
                "payment_summary": payment_report["summary"],
                "occupancy_summary": occupancy_report["summary"],
                "tenant_summary": tenant_report["summary"]
            }
            
            return dashboard
        except Exception as e:
            return {
                "success": False,
                "error": f"Failed to generate dashboard report: {str(e)}"
            }


report_service = ReportService()