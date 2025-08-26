import { supabase, handleSupabaseError } from './supabase'
import type { Tables, Inserts, Updates } from '../types/supabase'

// プロフィール関連の操作
export const profileService = {
  // プロフィールを取得
  async getProfile(userId: string) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()
      
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return handleSupabaseError(error)
    }
  },

  // プロフィールを作成
  async createProfile(profile: Inserts<'profiles'>) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .insert(profile)
        .select()
        .single()
      
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return handleSupabaseError(error)
    }
  },

  // プロフィールを更新
  async updateProfile(userId: string, updates: Updates<'profiles'>) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single()
      
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return handleSupabaseError(error)
    }
  }
}

// 経費申請関連の操作
export const expenseService = {
  // 経費申請一覧を取得
  async getExpenseApplications(userId?: string) {
    try {
      let query = supabase
        .from('expense_applications')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (userId) {
        query = query.eq('user_id', userId)
      }
      
      const { data, error } = await query
      
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return handleSupabaseError(error)
    }
  },

  // 経費申請を作成
  async createExpenseApplication(application: Inserts<'expense_applications'>) {
    try {
      const { data, error } = await supabase
        .from('expense_applications')
        .insert(application)
        .select()
        .single()
      
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return handleSupabaseError(error)
    }
  },

  // 経費申請を更新
  async updateExpenseApplication(id: string, updates: Updates<'expense_applications'>) {
    try {
      const { data, error } = await supabase
        .from('expense_applications')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return handleSupabaseError(error)
    }
  },

  // 経費申請を削除
  async deleteExpenseApplication(id: string) {
    try {
      const { error } = await supabase
        .from('expense_applications')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      return { error: null }
    } catch (error) {
      return handleSupabaseError(error)
    }
  }
}

// 出張申請関連の操作
export const businessTripService = {
  // 出張申請一覧を取得
  async getBusinessTripApplications(userId?: string) {
    try {
      let query = supabase
        .from('business_trip_applications')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (userId) {
        query = query.eq('user_id', userId)
      }
      
      const { data, error } = await query
      
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return handleSupabaseError(error)
    }
  },

  // 出張申請を作成
  async createBusinessTripApplication(application: Inserts<'business_trip_applications'>) {
    try {
      const { data, error } = await supabase
        .from('business_trip_applications')
        .insert(application)
        .select()
        .single()
      
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return handleSupabaseError(error)
    }
  },

  // 出張申請を更新
  async updateBusinessTripApplication(id: string, updates: Updates<'business_trip_applications'>) {
    try {
      const { data, error } = await supabase
        .from('business_trip_applications')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return handleSupabaseError(error)
    }
  },

  // 出張申請を削除
  async deleteBusinessTripApplication(id: string) {
    try {
      const { error } = await supabase
        .from('business_trip_applications')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      return { error: null }
    } catch (error) {
      return handleSupabaseError(error)
    }
  }
}

// 通知関連の操作
export const notificationService = {
  // 通知一覧を取得
  async getNotifications(userId: string) {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return handleSupabaseError(error)
    }
  },

  // 通知を作成
  async createNotification(notification: Inserts<'notifications'>) {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .insert(notification)
        .select()
        .single()
      
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return handleSupabaseError(error)
    }
  },

  // 通知を既読にする
  async markNotificationAsRead(id: string) {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return handleSupabaseError(error)
    }
  }
}
