"""
Contract Service Module

Handles all tenant lease agreement operations for Joyce Suites.
Manages contract creation, retrieval, updates, and termination.

This module is intentionally decoupled from Flask to maintain separation of concerns.
All database operations should be injected or called separately through models.
"""

from datetime import datetime
from enum import Enum
from typing import Dict, Optional, Any
from decimal import Decimal


class ContractStatus(Enum):
    """Enumeration for contract statuses."""
    ACTIVE = "active"
    TERMINATED = "terminated"
    PENDING = "pending"
    EXPIRED = "expired"


class ContractService:
    """Service class for managing tenant contracts."""

    @staticmethod
    def validate_contract_dates(start_date: str, end_date: str) -> tuple[bool, Optional[str]]:
        """
        Validate contract start and end dates.
        
        Args:
            start_date: Contract start date (ISO format: YYYY-MM-DD)
            end_date: Contract end date (ISO format: YYYY-MM-DD)
        
        Returns:
            Tuple of (is_valid, error_message)
        """
        try:
            start = datetime.fromisoformat(start_date)
            end = datetime.fromisoformat(end_date)
        except (ValueError, TypeError):
            return False, "Invalid date format. Use ISO format (YYYY-MM-DD)"
        
        if start >= end:
            return False, "Start date must be before end date"
        
        if start < datetime.now():
            return False, "Start date cannot be in the past"
        
        return True, None

    @staticmethod
    def validate_rent_amount(rent_amount: Any) -> tuple[bool, Optional[str]]:
        """
        Validate rent amount.
        
        Args:
            rent_amount: The rent amount to validate
        
        Returns:
            Tuple of (is_valid, error_message)
        """
        try:
            amount = Decimal(str(rent_amount))
        except (ValueError, TypeError):
            return False, "Rent amount must be a valid number"
        
        if amount <= 0:
            return False, "Rent amount must be greater than zero"
        
        return True, None

    def create_contract(
        self,
        tenant_id: int,
        room_id: int,
        start_date: str,
        end_date: str,
        rent_amount: Any,
        **kwargs
    ) -> Dict[str, Any]:
        """
        Create a new tenant contract.
        
        Args:
            tenant_id: Unique identifier for the tenant
            room_id: Unique identifier for the room
            start_date: Contract start date (ISO format: YYYY-MM-DD)
            end_date: Contract end date (ISO format: YYYY-MM-DD)
            rent_amount: Monthly rent amount in KES
            **kwargs: Additional optional fields (notes, deposit_amount, etc.)
        
        Returns:
            Dictionary with contract details or error information
        
        Raises:
            ValueError: If validation fails
        """
        # Validate required fields
        if not tenant_id or not room_id:
            return {
                "success": False,
                "error": "Tenant ID and Room ID are required"
            }
        
        # Validate dates
        date_valid, date_error = self.validate_contract_dates(start_date, end_date)
        if not date_valid:
            return {"success": False, "error": date_error}
        
        # Validate rent amount
        amount_valid, amount_error = self.validate_rent_amount(rent_amount)
        if not amount_valid:
            return {"success": False, "error": amount_error}
        
        try:
            contract = {
                "contract_id": self._generate_contract_id(),
                "tenant_id": tenant_id,
                "room_id": room_id,
                "start_date": start_date,
                "end_date": end_date,
                "rent_amount": float(Decimal(str(rent_amount))),
                "status": ContractStatus.PENDING.value,
                "created_at": datetime.now().isoformat(),
                "updated_at": datetime.now().isoformat(),
                "notes": kwargs.get("notes", ""),
                "deposit_amount": float(Decimal(str(kwargs.get("deposit_amount", 0))))
            }
            
            # In production, this would persist to the database
            # contract = Contract.create(**contract)
            
            return {
                "success": True,
                "message": "Contract created successfully",
                "contract": contract
            }
        except Exception as e:
            return {
                "success": False,
                "error": f"Failed to create contract: {str(e)}"
            }

    def get_contract_by_tenant(self, tenant_id: int) -> Dict[str, Any]:
        """
        Retrieve contract information for a specific tenant.
        
        Args:
            tenant_id: Unique identifier for the tenant
        
        Returns:
            Dictionary with contract details or error information
        """
        if not tenant_id:
            return {
                "success": False,
                "error": "Tenant ID is required"
            }
        
        try:
           
            contract = {
                "contract_id": "CNT001",
                "tenant_id": tenant_id,
                "room_id": 101,
                "start_date": "2025-01-01",
                "end_date": "2026-01-01",
                "rent_amount": 25000.00,
                "status": ContractStatus.ACTIVE.value,
                "created_at": "2025-01-01T10:00:00",
                "updated_at": "2025-01-01T10:00:00",
                "notes": "Standard 12-month lease",
                "deposit_amount": 25000.00
            }
            
            return {
                "success": True,
                "contract": contract
            }
        except Exception as e:
            return {
                "success": False,
                "error": f"Failed to retrieve contract: {str(e)}"
            }

    def update_contract(
        self,
        tenant_id: int,
        updates: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Update an existing contract.
        
        Args:
            tenant_id: Unique identifier for the tenant
            updates: Dictionary of fields to update
        
        Returns:
            Dictionary with updated contract or error information
        """
        if not tenant_id:
            return {
                "success": False,
                "error": "Tenant ID is required"
            }
        
        if not updates:
            return {
                "success": False,
                "error": "No updates provided"
            }
        
        try:
           
            if "rent_amount" in updates:
                amount_valid, amount_error = self.validate_rent_amount(updates["rent_amount"])
                if not amount_valid:
                    return {"success": False, "error": amount_error}
                updates["rent_amount"] = float(Decimal(str(updates["rent_amount"])))
            
            if "end_date" in updates:
                # Note: In production, validate that new end_date is reasonable
                pass
            
           
            
            updated_contract = {
                "contract_id": "CNT001",
                "tenant_id": tenant_id,
                "updated_at": datetime.now().isoformat(),
                **updates
            }
            
            return {
                "success": True,
                "message": "Contract updated successfully",
                "contract": updated_contract
            }
        except Exception as e:
            return {
                "success": False,
                "error": f"Failed to update contract: {str(e)}"
            }

    def terminate_contract(
        self,
        tenant_id: int,
        reason: str
    ) -> Dict[str, Any]:
        """
        Terminate a tenant's contract.
        
        Args:
            tenant_id: Unique identifier for the tenant
            reason: Reason for contract termination
        
        Returns:
            Dictionary with termination details or error information
        """
        if not tenant_id:
            return {
                "success": False,
                "error": "Tenant ID is required"
            }
        
        if not reason or not isinstance(reason, str):
            return {
                "success": False,
                "error": "Termination reason is required"
            }
        
        try:
            
            termination_record = {
                "contract_id": "CNT001",
                "tenant_id": tenant_id,
                "previous_status": ContractStatus.ACTIVE.value,
                "new_status": ContractStatus.TERMINATED.value,
                "termination_date": datetime.now().isoformat(),
                "reason": reason,
                "message": "Contract terminated successfully"
            }
            
            return {
                "success": True,
                "termination": termination_record
            }
        except Exception as e:
            return {
                "success": False,
                "error": f"Failed to terminate contract: {str(e)}"
            }

    @staticmethod
    def _generate_contract_id() -> str:
        """
        Generate a unique contract ID.
        
        Returns:
            Unique contract identifier
        """
        from uuid import uuid4
        return f"CNT-{uuid4().hex[:8].upper()}"


# Convenience instance for use in Flask routes
contract_service = ContractService()